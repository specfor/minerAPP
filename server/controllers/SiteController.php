<?php


class SiteController
{
    /**
     * For site default values, naming convention to use in HTML document is 'site:variable'.
     * For other variables it should be path_to_file:filename:variable.
     * Note that path_to_file should start from view directory.
     * For example, placeholder variables in login.php should use like 'forms:login:username'.
     * This procedure is used to prevent placeholder collisions.
     */

    /**
     * This array is passed to render with every page.
     * To override these values specify them in the $placeholderValues array.
     */
    public static array $SiteSettings = [
        'site:title'=>'Miner House',
        'site:favicon' => '',
    ];


    /**
     * All the functions in here are used to call render function with their placeholder values.
     */

    public static function httpError(Exception $exception)
    {
        $page = new Page(body: 'errorPage');
        $placeholderValues = [
            'site:title' => self::$SiteSettings['site:title'].' - Not Found',
            'errorPage:err-message' => $exception->getMessage()
        ];
        Application::$app->renderer->renderPage($page, $placeholderValues);
    }

    public function home()
    {
        $page = new Page();
        Application::$app->renderer->renderPage($page);
    }
}