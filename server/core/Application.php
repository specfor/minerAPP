<?php

//Import core modules
require_once 'Database.php';
require_once 'Router.php';
require_once 'Session.php';
require_once 'Request.php';
require_once 'Response.php';
require_once 'Renderer.php';

//Import controllers
require_once './../controllers/SiteController.php';

//Import modules
require_once './../models/User.php';


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


    /**
     * Return an instance of Application
     * @param array $config parse an nested array of configurations.
     */
    public function __construct(array $config)
    {
        self::$app = $this;

        $this->response = new Response();
        $this->request = new Request();
        $this->router = new Router($this->request, $this->response);
        $this->db = new Database($config['db']['servername'], $config['db']['dbname'],
            $config['db']['username'], $config['db']['password']);

    }

    /**
     * Start the application. Call to resolveRoute.
     * If any error occurred, call to render the relevant error page.
     */
    public function run()
    {
//        try {
//            echo $this->router->resolveRoute();
//        } catch (Exception $e) {
//            $this->response->setStatusCode($e->getCode());
//            echo $this->view->renderView('_error', [
//                'exception' => $e
//            ]);
//        }
    }
}