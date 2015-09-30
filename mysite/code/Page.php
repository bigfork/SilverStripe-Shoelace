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

		$themeDir = 'themes/' . Config::inst()->get('SSViewer', 'theme');

		Requirements::combine_files(
			'application.js',
			array (
				$themeDir . '/js/app.min.js'
			)
		);
	}

}
