<?php
namespace Bigfork\Installer;

use Composer\Script\Event;
use Spyc;

/**
 * Our magic installererererer.
 * Everything in here is geared towards setting up a SilverStripe project.
 */
class Install
{
    /**
     * The file that contains environment information
     */
    const ENVIRONMENT_FILE = '_ss_environment.php';

    /**
     * @var string
     */
    private static $basePath = '';

    /**
     * Get the document root for this project. Attempts getcwd(), falls back to
     * directory traversal.
     *
     * @return string
     */
    public static function getBasepath()
    {
        if (!self::$basePath) {
            $candidate = getcwd() ?: dirname(dirname(dirname(dirname(__FILE__))));
            self::$basePath = rtrim($candidate, DIRECTORY_SEPARATOR);
        }

        return self::$basePath;
    }

    /**
     * Returns a text description of the current environment type. Assumes
     * 'live' if it can't determine an environment type.
     *
     * @return string
     */
    protected static function getEnvironmentType()
    {
        if ($file = self::getEnvironmentFile()) {
            include_once $file;

            if (defined('GLOBAL_ENVIRONMENT_TYPE')) {
                return GLOBAL_ENVIRONMENT_TYPE;
            }
        }

        return 'live';
    }

    /**
     * Try to find a file that contains information about the environment. Scans
     * the current working directory and all parents looking for the file.
     *
     * @return string|boolean
     */
    protected static function getEnvironmentFile()
    {
        $envFile = self::ENVIRONMENT_FILE;
        $directory = realpath('.');

        // Traverse directories "upwards" searching for an environment file
        do {
            $directory .= DIRECTORY_SEPARATOR;

            // // If we can't read the directory, give up
            if (!is_readable($directory)) {
                break;
            }

            // If the file exists, return its path
            if (file_exists($directory.$envFile)) {
                return $directory.$envFile;
            }

            // Go up a level
            $directory = dirname($directory);
        } while (dirname($directory) != $directory); // If these are the same, we've hit the root of the drive

        return false;
    }

    /**
     * Called after every "composer update" command, or after a "composer install"
     * command has been executed without a lock file present
     *
     * @param Composer\Script\Event $event
     * @return void
     */
    public static function postUpdate(Event $event)
    {
        // Check environment type
        if (self::getEnvironmentType() !== 'dev') {
            exit;
        }

        $io = $event->getIO();
        $basePath = self::getBasepath();

        // If the theme has already been renamed, assume this setup is complete
        if (file_exists($basePath.'/themes/default')) {
            // Only try to rename things if the user actually provides some info
            if ($theme = $io->ask('Please specify the theme name: ')) {
                $config = array(
                    'theme' => $theme,
                    'sql-host' => $io->ask('Please specify the database host: '),
                    'sql-name' => $io->ask('Please specify the database name: '),
                );

                self::applyConfiguration($config);
                self::installNpm($config);
                self::removeReadme();
            }
        }

        exit;
    }

    /**
     * Renames the 'default' theme directory and updates SilverStripe YAML
     * configuration files.
     *
     * @param array $config
     * @return void
     */
    protected static function applyConfiguration(array $config)
    {
        $base = self::getBasepath();
        include $base.'/framework/thirdparty/spyc/spyc.php';

        // Rename theme directory
        $themeBase = $base.'/themes/';
        rename($themeBase.'default/', $themeBase.$config['theme'].'/');

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
     * Update config.yml with relevant information in provided config.
     *
     * @param string $filePath
     * @param array $config
     * @return void
     */
    protected static function updateYamlConfig($filePath, array $config)
    {
        $contents = file_get_contents($filePath);
        $blocks = preg_split('/^---$/m', $contents, -1, PREG_SPLIT_NO_EMPTY);

        $mainBlock = false;
        $parsedBlocks = array();
        for ($i = 0; $i < count($blocks); $i++) {
            $yamlConfig = Spyc::YAMLLoad($blocks[$i]);

            // Flag that we've hit the "main" block we want to perform renaming on
            if (isset($yamlConfig['Name']) && $yamlConfig['Name'] === 'default') {
                $yamlConfig['Name'] = $config['theme'];
                $mainBlock = true;
            } elseif ($mainBlock) {
                // Update YAML config
                $yamlConfig['SSViewer']['theme'] = $config['theme'];

                if (isset($config['sql-host']) || isset($config['sql-name'])) {
                    $yamlConfig['Database']['host'] = $config['sql-host'];
                    $yamlConfig['Database']['name'] = $config['sql-name'];
                }

                $mainBlock = false;
            }

            $parsedBlocks[] = $yamlConfig;
        }

        // Write our updated config file
        $config = implode('', array_map(function($block) {
            return Spyc::YAMLDump($block);
        }, $parsedBlocks));

        file_put_contents($filePath, $config);
    }

    /**
     * Update logging.yml with relevant information in provided config.
     *
     * @param string $filePath
     * @param array $config
     * @return void
     */
    protected static function updateLoggingConfig($filePath, array $config)
    {
        $contents = file_get_contents($filePath);
        $blocks = preg_split('/^---$/m', $contents, -1, PREG_SPLIT_NO_EMPTY);

        $mainBlock = false;
        $parsedBlocks = array();
        for ($i = 0; $i < count($blocks); $i++) {
            $yamlConfig = Spyc::YAMLLoad($blocks[$i]);

            // Flag that we've hit the "main" block we want to perform renaming on
            if (isset($yamlConfig['Name']) && $yamlConfig['Name'] === 'logging') {
                $mainBlock = true;
            } elseif ($mainBlock) {
                // Update YAML config
                $name = $config['theme'];
                $yamlConfig['Injector']['Monolog']['constructor'][0] = "'{$name}'";

                $mainBlock = false;
            }

            $parsedBlocks[] = $yamlConfig;
        }

        // Write our updated config file
        $config = implode('', array_map(function($block) {
            return Spyc::YAMLDump($block);
        }, $parsedBlocks));

        file_put_contents($filePath, $config);
    }

    /**
     * Runs "npm install" if a package.json file is present in the project.
     *
     * @param array $config
     * @return void
     */
    protected static function installNpm(array $config)
    {
        $basePath = self::getBasepath();
        $themePath = $basePath.'/themes/'.$config['theme'].'/';

        if (file_exists($themePath.'/package.json')) {
            $current = __DIR__;
            chdir($themePath);
            echo shell_exec('npm install');
            chdir($current);
        }
    }

    /**
     * Removes README.md from the project.
     *
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
