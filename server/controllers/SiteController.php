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
     * Override these values to change any settings for specific page.
     */
    public static array $SiteSettings = [
        'site:title' => 'Miner House',
        'site:favicon' => '',
    ];

    /**
     * Append this part to the beginning of the title.
     * NOTE- should be called before calling render function.
     * For example := calling with 'Login' will result in changing the title to 'Login - SiteName'.
     * @param string $title Title for the page.
     */
    public static function appendToTitle(string $title)
    {
        self::$SiteSettings['site:title'] = $title . ' - ' . self::$SiteSettings['site:title'];
    }


    /**
     * All the functions in here are used to call render function with their placeholder values.
     */

    public static function httpError(Exception $exception)
    {
        $page = new Page(body: 'errorPage', title: $exception->getMessage());
        $placeholderValues = [
            'errorPage:err-message' => $exception->getMessage()
        ];
        Application::$app->renderer->renderPage($page, $placeholderValues);
    }

    public function home()
    {
        $page = new Page();
        Application::$app->renderer->renderPage($page);
    }

    public function login()
    {
        if (Application::$app->request->isGet()) {
            $page = new Page(Page::BLANK_HEADER, Page::BLANK_FOOTER, body: 'forms/login', title: 'Login');
            Application::$app->renderer->renderPage($page);
        } elseif (Application::$app->request->isPost()) {
            $params = Application::$app->request->getBodyParams();
            $user = new User();
            $userId = $user->validateUser($params['email'], $params['password']);
            if ($userId) {
                $_SESSION['userId'] = $userId;
                Application::$app->response->redirect('/');
            } else {
                // Only a temporary code
                Application::$app->response->redirect('/failedLogin');
            }
        }
    }

    public function register()
    {
        if (Application::$app->request->isGet()) {
            $page = new Page(Page::BLANK_HEADER, Page::BLANK_FOOTER, body: 'forms/register', title: 'Register');
            Application::$app->renderer->renderPage($page);
        } elseif (Application::$app->request->isPost()) {
            $user = new User();
            $success = $user->createNewUser(Application::$app->request->getBodyParams());
            if ($success) {
                Application::$app->response->redirect('/login');
            } else {
                // Only a temporary code
                Application::$app->response->redirect('/failedRegister');
            }
        }
    }
}