<?php

class SiteSettingsAdmin extends LeftAndMain implements PermissionProvider
{
    private static $url_segment = 'site-settings';

    private static $url_rule = '/$Action/$ID/$OtherID';

    private static $menu_title = 'Site Settings';

    private static $menu_priority = -0.5;

    private static $menu_icon = 'mysite/images/site-settings.png';

    private static $required_permission_codes = ['EDIT_SITE_SETTINGS'];

    /**
     * {@inheritdoc}
     */
    public function providePermissions()
    {
        return [
            'EDIT_SITE_SETTINGS' => [
                'name' => _t('CMSMain.ACCESS', "Access to '{title}' section", ['title' => 'Site Settings']),
                'category' => _t('Permission.CMS_ACCESS_CATEGORY', 'CMS Access')
            ]
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getEditForm($id = null, $fields = null)
    {
        $config = SiteConfig::current_site_config();
        $fields = FieldList::create(
            EmailField::create('EmailAddress', 'Email Address')
        );

        $actions = FieldList::create(
            FormAction::create('saveSettings', _t('CMSMain.SAVE', 'Save'))
                ->setUseButtonTag(true)
                ->addExtraClass('ss-ui-action-constructive')
                ->setAttribute('data-icon', 'accept')
        );

        $form = CMSForm::create($this, 'EditForm', $fields, $actions)
            ->setHTMLID('Form_EditForm')
            ->setResponseNegotiator($this->getResponseNegotiator())
            ->addExtraClass('cms-content center cms-edit-form')
            ->setAttribute('data-pjax-fragment', 'CurrentForm')
            ->loadDataFrom($config)
            ->setTemplate($this->getTemplatesWithSuffix('_EditForm'));

        $this->extend('updateEditForm', $form);

        return $form;
    }

    /**
     * @param array $data
     * @param Form $form
     * @param SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function saveSettings(array $data, Form $form, SS_HTTPRequest $request)
    {
        $config = SiteConfig::current_site_config();
        $form->saveInto($config);

        try {
            $config->write();
        } catch(ValidationException $ex) {
            $form->sessionMessage($ex->getResult()->message(), 'bad');
            return $this->getResponseNegotiator()->respond($this->request);
        }

        $this->response->addHeader('X-Status', rawurlencode(_t('LeftAndMain.SAVEDUP', 'Saved.')));
        return $this->getResponseNegotiator()->respond($this->request);
    }
}
