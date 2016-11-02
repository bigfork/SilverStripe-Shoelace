<?php

use SilverStripe\Core\Config\Config;
use SilverStripe\Forms\HTMLEditor\TinyMCEConfig;
use SilverStripe\i18n\i18n;

$config = Config::inst();

// optionally use a different database on dev
if (!preg_match('/(\.local|\.dev|\.proxylocal\.com)$/', $_SERVER['HTTP_HOST'])) {
    define('SS_DATABASE_SERVER', 'localhost');
} elseif (!defined('SS_DATABASE_SERVER')) {
    define('SS_DATABASE_SERVER', $config->get('Database', 'host'));
}

// use database name from config.yml unless defined in environment
if (!defined('SS_DATABASE_NAME')) {
    define('SS_DATABASE_NAME', $config->get('Database', 'name'));
}

define('SS_DATABASE_CLASS', 'MySQLPDODatabase');

// load config from environment
require_once 'conf/ConfigureFromEnv.php';

// Set the site locale
i18n::set_locale('en_GB');

// TinyMCE Config
$config = TinyMCEConfig::get('cms');
$config->enablePlugins(['anchor']);
$config->setButtonsForLine(1, 'formatselect | bullist numlist | bold italic subscript superscript
    | sslink unlink anchor ssmedia');
$config->setButtonsForLine(2, 'table | pastetext undo redo | code');
$config->setOptions([
    'block_formats' => 'Paragraph=p;Heading 2=h2;Heading 3=h3'
]);
