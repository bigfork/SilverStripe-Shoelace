<?php

class Page extends SiteTree {
	
	/**
	 * @return FieldList 
	 */
	public function getCMSFields() {
		$self =& $this;
		$this->beforeUpdateCMSFields(function($fields) use ($self) {
			$homeURL = Config::inst()->get('RootURLController', 'default_homepage_link');
			if (!Permission::check('ADMIN') && $self->URLSegment === $homeURL) {
				$fields->removeByName('URLSegment');
			}
		});
		
		return parent::getCMSFields();
	}

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
		Requirements::set_force_js_to_bottom(true);
		Requirements::set_suffix_requirements(false);
		Requirements::combine_files(
			'application.js',
			array (
				$themeDir . '/js/app.min.js'
			)
		);
	}

}
