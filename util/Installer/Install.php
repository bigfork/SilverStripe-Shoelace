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

		include('mysite/_project_settings.php');
		self::performRename($theme);

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
		exit;
	}

	/**
	 * Rename the 'default' theme folder and package name in package.json
	 * @param string $projectName
	 * @return void
	 */
	public static function performRename($projectName) {
		$base = __DIR__ . '/../../';
		$themeBase = $base . 'themes/';
		@rename($themeBase . 'default/', $themeBase . $projectName . '/');

		$json = file_get_contents($base . 'package.json');
		$contents = json_decode($json, true);
		$contents['name'] = $projectName;
		$json = json_encode($contents);
		file_put_contents($base . 'package.json', $json);
	}

}