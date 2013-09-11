<?php
namespace util\Installer;
use Composer\Script\Event;

/**
 * Our magic installererererer
 */
class Install {

	/**
	 * @param Event $event
	 * @return void
	 */
	public static function postInstall(Event $event) {
		if ( ! stristr(__DIR__, 'Devsites')) exit;
		$base = __DIR__ . '/../../';

		// If the theme has already been renamed, assume setup complete
		if (file_exists($base . 'themes/default')) {
			$io = $event->getIO();
			if ($theme = $io->ask('Please specify the theme name: ')) {
				$dbHost = $io->ask('Please specify the database host: ');
				$dbName = $io->ask('Please specify the database name: ');

				self::performRename($theme, $dbHost, $dbName);
			}
		}
		
		if ($io->ask('Would you like to set up a vhost? (y/n): ') == 'y') {
			$hostName = $io->ask('Please specify the host name: ');
			self::setupVhost($hostName);
		}

		self::installNpm();
		exit;
	}

	/**
	 * @param Event $event
	 * @return void
	 */
	public static function postUpdate(Event $event) {
		if ( ! stristr(__DIR__, 'Devsites')) exit;
		
		self::installNpm();
		exit;
	}

	/**
	 * @return void
	 */
	public static function installNpm() {
		chdir(__DIR__ . '/../../');
		echo shell_exec('npm install');
	}

	/**
	 * Rename the 'default' theme folder and package name in package.json. Also 
	 * updates mysite/_config/config.yml
	 * @param string $theme
	 * @param string|null $dbHost
	 * @param string|null $dbName
	 * @return void
	 */
	public static function performRename($theme, $dbHost = null, $dbName = null) {
		if ( ! stristr(__DIR__, 'Devsites')) exit;

		$base = __DIR__ . '/../../';
		$yamlPath = $base . 'mysite/_config/config.yml';

		include($base . 'framework/thirdparty/spyc/spyc.php');
		$contents = file_get_contents($yamlPath);
		$config = \Spyc::YAMLLoad($contents);

		// Rename theme directory
		$themeBase = $base . 'themes/';
		@rename($themeBase . 'default/', $themeBase . $theme . '/');

		// Update package.json with theme name
		$json = file_get_contents($base . 'package.json');
		$contents = json_decode($json, true);
		$contents['name'] = $theme;
		$json = json_encode($contents);
		file_put_contents($base . 'package.json', $json);
		
		// Update YAML config
		$config['SSViewer']['current_theme'] = $theme;
		if ($dbHost || $dbName) {
			$config['Database']['host'] = $dbHost;
			$config['Database']['name'] = $dbName;
		}

		$yaml = \Spyc::YAMLDump($config);
		file_put_contents($yamlPath, $yaml);
	}

	/**
	 * @param string $hostNAme
	 * @return void
	 */
	public static function setupVhost($hostName) {
		$current = __DIR__;
		chdir(__DIR__ . '/../../');
		$fileName = '/private/etc/apache2/sites-enabled/' . basename(getcwd()) . '.conf';
		$folderPath = getcwd();
		chdir($current);

		$data = <<<XML
<VirtualHost *:80>
    DocumentRoot "$folderPath"
    ServerName $hostName
    ServerAlias $hostName.t.proxylocal.com
</VirtualHost>
XML;

		file_put_contents($fileName, $data);
	}

}
