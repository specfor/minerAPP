<?php

use AnyKey\Server\controllers\ApiControllerV1;
use AnyKey\Server\controllers\SiteController;
use AnyKey\Server\core\Application;

require_once __DIR__.'/../vendor/autoload.php';

//Loading database details to environment variables
$dotenv = \Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->load();

$config = [
    'rootPath' => dirname(__DIR__),
    'db' => [
        "servername" => $_ENV['DB_SERVERNAME'],
        "username" => $_ENV['DB_USERNAME'],
        "password" => $_ENV['DB_PASSWORD']
    ]
];

$app = new Application($config);

// Web routes
$app->router->addGetRoute('/', [SiteController::class, 'home']);
$app->router->addGetRoute('/login', [SiteController::class, 'login']);
$app->router->addPostRoute('/login', [SiteController::class, 'login']);
$app->router->addGetRoute('/register', [SiteController::class, 'register']);
$app->router->addPostRoute('/register', [SiteController::class, 'register']);

// API routes
$app->router->addPostRoute('/api/v1/login', [ApiControllerV1::class, 'login']);

$app->run();
