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

		$themeDir = Director::baseURL() . 'themes/' . SSViewer::current_theme();
		$requirements = array(
			'//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js',
			$themeDir . '/js/app.min.js'
		);

		Requirements::set_write_js_to_body(false);
		Yepnope::add_files($requirements);
		Yepnope::set_timeout(10000);
	}

}
