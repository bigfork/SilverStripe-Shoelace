<?php

class Page extends SiteTree {

	/**
	 * @return FieldList $fields
	 */
	public function getSettingsFields() {
		$fields = parent::getSettingsFields();
		// Hide ShowInSearch checkbox if we don't have a search
		$fields->removeByName('ShowInSearch');
		return $fields;
	}

}

class Page_Controller extends ContentController {

	/**
	 * @return void
	 */
	public function init() {
		parent::init();

		$requirements = array(
			'https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js',
			'/themes/' . SSViewer::current_theme() . '/js/app.min.js'
		);
		Yepnope::set_write_js_to_body(false);
		Yepnope::add_files($requirements, null, 'function(){ init(); }' );
		Yepnope::set_timeout(10000);
	}

}
