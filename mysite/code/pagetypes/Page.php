<?php

class Page extends SiteTree
{
    /**
     * {@inheritdoc}
     */
    public function getCMSFields()
    {
        $this->beforeUpdateCMSFields(function($fields) {
            $homeURL = Config::inst()->get('RootURLController', 'default_homepage_link');

            if (!Permission::check('ADMIN') && $this->URLSegment === $homeURL) {
                $fields->removeByName('URLSegment');
            }
        });

        return parent::getCMSFields();
    }

    /**
     * {@inheritdoc}
     */
    public function getSettingsFields()
    {
        $fields = parent::getSettingsFields();

        // Hide ShowInSearch checkbox if we don't have a search
        $fields->removeByName('ShowInSearch');

        return $fields;
    }
}

class Page_Controller extends ContentController
{
    /**
     * {@inheritdoc}
     */
    public function init()
    {
        parent::init();

        $themeDir = 'themes/' . Config::inst()->get('SSViewer', 'theme');
        Requirements::set_force_js_to_bottom(true);
        Requirements::combine_files('application.js', [$themeDir . '/js/app.min.js']);
    }
}
