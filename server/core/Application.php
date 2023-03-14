<?php

namespace AnyKey\Server\core;

use AnyKey\Server\controllers\SiteController;
use AnyKey\Server\models\User;
use Exception;

/**
 * Class Application
 */
class Application
{
    public static Application $app;
    public Database $db;
    public Router $router;
    public User $user;
    public Request $request;
    public Response $response;
    public Renderer $renderer;
    public Session $session;

    public static string $ROOT_DIR;

    /**
     * Set the website to maintenance mode. When set to true, maintenance page will be displayed.
     */
    protected static bool $maintenanceMode = false;

    /**
     * Return an instance of Application
     * @param array $config parse a nested array of configurations.
     */
    public function __construct(array $config)
    {
        self::$app = $this;
        self::$ROOT_DIR = $config['rootPath'];

        // If in maintenance mode, maintenance page is displayed. Application exits.
        if (self::$maintenanceMode) {
            require_once './../view/maintenanceMode.php';
            exit();
        }

        $this->response = new Response();
        $this->request = new Request();
        $this->renderer = new Renderer();
        $this->router = new Router($this->request, $this->response);
        $this->db = new Database($config['db']['servername'], $config['db']['username'], $config['db']['password']);
    }

    /**
     * Start the application. Call to resolveRoute.
     * If any error occurred, call to render the relevant error page.
     */
    public function run(): void
    {
        try {
            $this->router->resolveRoute();
        } catch (Exception $e) {
            SiteController::httpError($e);
        }
    }
}