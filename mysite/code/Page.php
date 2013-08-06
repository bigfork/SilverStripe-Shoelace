<?php
class Page extends SiteTree {

	public static $db = array(

	);

	public function getCMSFields(){
		$fields = parent::getCMSFields();
		return $fields;
	}

	public function getSettingsFields() {
		$fields = parent::getSettingsFields();
		// Hide ShowInSearch checkbox if we don't have a search
		$fields->removeByName('ShowInSearch');
		return $fields;
	}

}
class Page_Controller extends ContentController {

	public static $allowed_actions = array (
	);

	public function init() {
		parent::init();

		$requirements = array(
			'https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
			'themes/nflc/js/application.min.js'
		);
		Yepnope::set_write_js_to_body(false);
		Yepnope::add_files($requirements, null, 'function(){ init(); }' );
		Yepnope::set_timeout(10000);
	}

}