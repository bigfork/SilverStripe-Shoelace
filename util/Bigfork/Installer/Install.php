<?php
namespace Bigfork\Installer;

use Composer\Script\Event;
use Spyc;

/**
 * Our magic installererererer.
 * Everything in here is geared towards setting up a SilverStripe project.
 * @todo Improve environment checks, rather than guessing based on directory
 */
class Install
{
    /**
     * @var string
     */
    private static $basePath = '';

    /**
     * Get the document root for this project.
     * @todo Is there a way of getting this info via Composer\Script\Event?
     * @return string
     */
    public static function getBasepath()
    {
        if (! self::$basePath) {
            $candidate = dirname(dirname(dirname(dirname(__FILE__))));
            self::$basePath = rtrim($candidate, DIRECTORY_SEPARATOR);
        }

        return self::$basePath;
    }

    /**
     * Called after every "composer install" command.
     * @todo Remove local configuration options (bigfork.json)
     * @param  Composer\Script\Event $event
     * @return void
     */
    public static function postInstall(Event $event)
    {
        $io = $event->getIO();
        $basePath = self::getBasepath();

        // Crude check for development vs live environments
        if (! stristr(__DIR__, 'Devsites')) {
            exit;
        }

        // Local configuration options
        $homeDir = dirname(dirname($basePath));
        $conffile = rtrim($homeDir, DIRECTORY_SEPARATOR).'/bigfork.json';
        if (file_exists($conffile)) {
            $userconfig = json_decode(file_get_contents($conffile), true);
        } else {
            exit;
        }

        // If the theme has already been renamed, assume this setup is complete
        if (file_exists($basePath.'/themes/default')) {
            // Only try to rename things if the user actually provides some info
            if ($theme = $io->ask('Please specify the theme name: ')) {
                $config = array(
                    'theme' => $theme,
                    'description' => $io->ask('Please specify the project description: '),
                    'sql-host' => $io->ask('Please specify the database host: '),
                    'sql-name' => $io->ask('Please specify the database name: '),
                );

                if (isset($userconfig['extras'])) {
                    $config['extras'] = $userconfig['extras'];
                }

                self::applyConfiguration($config);
                self::removeReadme();
            }
        }

        if ($io->ask('Would you like to set up a vhost? (y/n): ') == 'y') {
            $hostName = $io->ask('Please specify the host name (excluding \'.dev\'): ');
            self::setupVhost($hostName);
        }

        self::installNpm();
        exit;
    }

    /**
     * @param  Composer\Script\Event $event
     * @return void
     */
    public static function postUpdate(Event $event)
    {
        // Crude check for development vs live environments
        if (! stristr(__DIR__, 'Devsites')) {
            exit;
        }

        self::installNpm();
        exit;
    }

    /**
     * Rename the 'default' theme directory, amend package name, description and
     * settings in package.json (if present). Also updates a few SilverStripe
     * configuration files.
     * @param  array $config
     * @return void
     */
    protected static function applyConfiguration(array $config)
    {
        $base = self::getBasepath();
        include $base.'/framework/thirdparty/spyc/spyc.php';

        // Rename theme directory
        $themeBase = $base.'/themes/';
        @rename($themeBase.'default/', $themeBase.$config['theme'].'/');

        // Update package.json with provided information
        $packagePath = $base.'/package.json';
        if (file_exists($packagePath)) {
            self::updateNpmPackage($packagePath, $config);
        }

        // Update config.yml
        $configPath = $base.'/mysite/_config/config.yml';
        if (file_exists($configPath)) {
            self::updateYamlConfig($configPath, $config);
        }

        // Update info in logging configuration
        $loggingPath = $base.'/mysite/_config/logging.yml';
        if (file_exists($loggingPath)) {
            self::updateLoggingConfig($loggingPath, $config);
        }
    }

    /**
     * Update package.json with relevant information in provided config.
     * @todo Remove $config['extras'] stuff?
     * @param  string $filePath
     * @param  array  $config
     * @return void
     */
    protected static function updateNpmPackage($filePath, array $config)
    {
        $json = file_get_contents($filePath);
        $old = json_decode($json, true);
        $new = array(
            'name' => $config['theme'],
            'description' => $config['description'],
            'sql' => array(
                'name' => $config['sql-name'],
                'host' => $config['sql-host'],
            ),
        );

        if (isset($config['extras']) && is_array($config['extras'])) {
            $new = array_merge($new, $config['extras']);
        }

        $contents = array_merge($old, $new);
        $json = json_encode($contents);
        file_put_contents($filePath, $json);
    }

    /**
     * Update config.yml with relevant information in provided config.
     * @param  string $filePath
     * @param  array  $config
     * @return void
     */
    protected static function updateYamlConfig($filePath, array $config)
    {
        $yamlConfig = Spyc::YAMLLoad(file_get_contents($filePath));

        // Update YAML config
        $yamlConfig['SSViewer']['current_theme'] = $config['theme'];
        if (isset($config['sql-host']) || isset($config['sql-name'])) {
            $yamlConfig['Database']['host'] = $config['sql-host'];
            $yamlConfig['Database']['name'] = $config['sql-name'];
        }

        // Write our updated config file
        $yaml = Spyc::YAMLDump($yamlConfig);
        file_put_contents($filePath, $yaml);
    }

    /**
     * Update logging.yml with relevant information in provided config.
     * @param  string $filePath
     * @param  array  $config
     * @return void
     */
    protected static function updateLoggingConfig($filePath, array $config)
    {
        $yamlConfig = Spyc::YAMLLoad(file_get_contents($filePath));

        $desc = $config['description'] ?: 'App';
        $yamlConfig['Injector']['Monolog']['constructor'][0] = "'{$desc}'";

        $yaml = Spyc::YAMLDump($yamlConfig);
        file_put_contents($filePath, $yaml);
    }

    /**
     * Runs "npm install" if a package.json file is present in the project.
     * @return void
     */
    protected static function installNpm()
    {
        $basePath = self::getBasepath();
        if (file_exists($basePath.'/package.json')) {
            $current = __DIR__;
            chdir($basePath);
            echo shell_exec('npm install');
            chdir($current);
        }
    }

    /**
     * Setup a new vhost. Makes very opinionated assumptions about paths,
     * doesn't restart apache.
     * @param  string $hostName
     * @return void
     */
    protected static function setupVhost($hostName)
    {
        $folderPath = self::getBasepath();
        $dirName = rtrim(basename($folderPath), DIRECTORY_SEPARATOR);
        $fileName = '/private/etc/apache2/sites-enabled/'.$dirName.'.conf';

        $data = <<<XML
<VirtualHost *:80>
    DocumentRoot "$folderPath"
    ServerName $hostName.dev
    ServerAlias $hostName.t.proxylocal.com
</VirtualHost>
XML;

        file_put_contents($fileName, $data);
    }

    /**
     * Removes README.md from the project.
     * @return void
     */
    protected static function removeReadme()
    {
        $basePath = self::getBasepath();

        if (file_exists($basePath.'/README.md')) {
            unlink($basePath.'/README.md');
        }
    }
}
