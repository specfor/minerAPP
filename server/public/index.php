<?php

require_once './../core/Application.php';

//Getting database details
$jsonRead = file_get_contents('./../databaseConfig.json');
$jsonData = json_decode($jsonRead, true);

$config = [
    'db' => [
        "servername" => $jsonData['servername'],
        "username" => $jsonData['username'],
        "password" => $jsonData['password'],
        "dbname" => $jsonData['dbname']
    ]
];

$app = new Application($config);

$app->router->addGetRoute('/', [SiteController::class, 'home']);

$app->run();
