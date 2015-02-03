<?php
$config = Config::inst();

// optionally use a different database on dev
if( ! preg_match('/(\.local|\.dev|\.proxylocal\.com)$/', $_SERVER['HTTP_HOST'])) {
	define('SS_DATABASE_SERVER', 'localhost');
} elseif( ! defined('SS_DATABASE_SERVER')) {
	define('SS_DATABASE_SERVER', $config->get('Database', 'host'));
}

// use database name from config.yml unless defined in environment
if( ! defined('SS_DATABASE_NAME')) {
	define('SS_DATABASE_NAME', $config->get('Database', 'name'));
}

// load config from environment
require_once 'conf/ConfigureFromEnv.php';

// Set the site locale
i18n::set_locale('en_GB');

// Set default password - remove this after creating a proper user
Security::setDefaultAdmin('admin', 'password');

// TinyMCE Config
$config = HtmlEditorConfig::get('cms');
$config->disablePlugins('emotions', 'fullscreen');
$config->setButtonsForLine(1, "formatselect,separator,bullist,numlist,
	separator,bold,italic,sup,sub,separator,sslink,unlink,anchor,separator,ssmedia,pasteword,
	separator,spellchecker,undo,redo,code");
$config->setButtonsForLine(2, "tablecontrols");
$config->setButtonsForLine(3, '');
$config->setOptions(array(
	'theme_advanced_blockformats' => 'p,h2,h3',
	'paste_auto_cleanup_on_paste' => 'true',
	'paste_remove_styles' => 'true',
	'paste_strip_class_attributes' => 'all',
	'paste_remove_spans' => 'true'
));
