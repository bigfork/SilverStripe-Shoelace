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

		$themeDir = Director::baseURL() . 'themes/' . Config::inst()->get('SSViewer', 'theme');
		$requirements = $themeDir . '/js/app.min.js';

		Requirements::set_write_js_to_body(false);
		Yepnope::set_timeout(10000);
		Yepnope::add_test(
			'(document.documentElement.className.indexOf(\'lte-ie8\') === -1)',
			'//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',
			'//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js',
			$requirements,
			null,
			null,
			'default'
		);
	}

}
