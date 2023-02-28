<?php

require_once 'Database.php';
require_once 'Router.php';
require_once 'User.php';
require_once 'Session.php';
require_once 'Request.php';
require_once 'Response.php';

class Application
{
    public static Application $app;
    public Database $db;
    public Router $router;
    public User $user;
    public Request $request;
    public Response $response;


    public function __construct($config)
    {
        self::$app = $this;

        $this->response = new Response();
        $this->request = new Request();
        $this->router = new Router($this->request, $this->response);
        $this->db = new Database($config['db']['servername'], $config['db']['dbname'],
            $config['db']['username'], $config['db']['password']);

    }

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