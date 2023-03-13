<?php

use AnyKey\Server\controllers\ApiControllerV1;
use AnyKey\Server\controllers\SiteController;
use AnyKey\Server\core\Application;

require_once __DIR__.'/../vendor/autoload.php';

//Getting database details
$jsonRead = file_get_contents('./../databaseConfig.json');
$jsonData = json_decode($jsonRead, true);

$config = [
    'rootPath' => dirname(__DIR__),
    'db' => [
        "servername" => $jsonData['servername'],
        "username" => $jsonData['username'],
        "password" => $jsonData['password']
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
