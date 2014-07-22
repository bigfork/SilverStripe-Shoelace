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

		$conf = array();

		// local config
		$conffile = $base . '../../bigfork.json';
		if (file_exists($conffile)) {
			$userconf = json_decode(file_get_contents($conffile), true);
		} else {
			exit;
		}

		$io = $event->getIO();

		// If the theme has already been renamed, assume setup complete
		if (file_exists($base . 'themes/default')) {
			if ($conf['theme'] = $io->ask('Please specify the theme name: ')) {
				$conf['description'] = $io->ask('Please specify the project description: ');
				$conf['sql-host'] = $io->ask('Please specify the database host: ');
				$conf['sql-name'] = $io->ask('Please specify the database name: ');

				self::performRename($conf);
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
	 * Rename the 'default' theme folder, package name and package description in package.json.
	 * Also updates mysite/_config/config.yml
	 * @param string $theme
	 * @param string $description
	 * @param string|null $dbHost
	 * @param string|null $dbName
	 * @return void
	 */
	public static function performRename($conf) {
		if ( ! stristr(__DIR__, 'Devsites')) exit;

		$base = __DIR__ . '/../../';
		$yamlPath = $base . 'mysite/_config/config.yml';

		include($base . 'framework/thirdparty/spyc/spyc.php');
		$contents = file_get_contents($yamlPath);
		$config = \Spyc::YAMLLoad($contents);

		// Rename theme directory
		$themeBase = $base . 'themes/';
		@rename($themeBase . 'default/', $themeBase . $conf['theme'] . '/');

		// Update package.json with theme name
		$json = file_get_contents($base . 'package.json');
		$contents = json_decode($json, true);
		$contents['name'] = $conf['theme'];
		$contents['description'] = $conf['description'];
		$contents['sql']['name'] = $conf['sql-name'];
		$contents['sql']['host'] = $conf['sql-host'];
		$json = json_encode($contents);
		file_put_contents($base . 'package.json', $json);

		// Update YAML config
		$config['SSViewer']['current_theme'] = $conf['theme'];
		if ($conf['sql-host'] || $conf['sql-name']) {
			$config['Database']['host'] = $conf['sql-host'];
			$config['Database']['name'] = $conf['sql-name'];
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
    ServerName $hostName.dev
    ServerAlias $hostName.t.proxylocal.com
</VirtualHost>
XML;

		file_put_contents($fileName, $data);
	}

	/**
	 * @return void
	 */
	public static function removeReadme() {
		$current = __DIR__;
		chdir(__DIR__ . '/../../');
		if (file_exists('README.md')){
			unlink('README.md');
		}
		chdir($current);
	}

}
