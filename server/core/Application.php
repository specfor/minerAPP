<?php

require_once 'Database.php';
require_once 'Router.php';
require_once 'User.php';
require_once 'Session.php';

class Application
{
    public static Application $app;
    public Database $db;
    public Router $router;

    public function __construct($config)
    {
        self::$app = $this;

        $this->router = new Router();
        $this->db = new Database($config['db']['servername'], $config['db']['dbname'],
            $config['db']['username'], $config['db']['password']);
    }
}