<?php

require_once './../core/Application.php';

//Getting database details
$jsonRead = file_get_contents('./../databaseConfig.json');
$jsonData = json_decode($jsonRead, true);

$config = [
    'rootPath' => dirname(__DIR__),
    'db' => [
        "servername" => $jsonData['servername'],
        "username" => $jsonData['username'],
        "password" => $jsonData['password'],
        "dbname" => $jsonData['dbname']
    ]
];

$app = new Application($config);

$app->router->addGetRoute('/', [SiteController::class, 'home']);
$app->router->addGetRoute('/login', [SiteController::class, 'login']);
$app->router->addPostRoute('/login', [SiteController::class, 'login']);
$app->router->addGetRoute('/register', [SiteController::class, 'register']);
$app->router->addPostRoute('/register', [SiteController::class, 'register']);

$app->run();
