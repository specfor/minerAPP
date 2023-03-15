<?php

namespace AnyKey\Server\controllers;

use AnyKey\Server\core\Application;
use AnyKey\Server\core\JWT;
use AnyKey\Server\models\API;
use AnyKey\Server\models\User;
use Carbon\Carbon;

class ApiControllerV1 extends API
{
    // Interval is in seconds.
    private const JWT_EXPIRE_INTERVAL = 3600;

    public function login(): void
    {
        if (Application::$app->request->isPost()) {
            $params = Application::$app->request->getBodyParams();
            $user = new User();
            if ($user->validateUser($params['email/username'], $params['password'])) {
                $user->loadUserData($user->userId);
                $payload = [
                    'id' => $user->userId,
                    'email' => $user->email,
                    'role' => $user->getUserRoleText(),
                    'exp' => time() + self::JWT_EXPIRE_INTERVAL
                ];
                $jwt = JWT::generateToken($payload);
                $returnPayload = [
                    'message' => 'Login successful.',
                    'token' => $jwt
                ];
                $this->sendResponse(self::STATUS_CODE_SUCCESS, self::STATUS_MSG_SUCCESS,
                    $returnPayload);
            } else {
                $returnPayload = [
                    'error' => 'Incorrect Username/Email or Password.'
                ];
                $this->sendResponse(self::STATUS_CODE_SUCCESS, self::STATUS_MSG_ERROR,
                    $returnPayload);
            }
        }
    }

    public function register(): void
    {
        $params = Application::$app->request->getBodyParams();
        $user = new User();
        $status = $user->createNewUser($params);
        if ($status === 'user created.') {
            $this->sendResponse(self::STATUS_CODE_SUCCESS, self::STATUS_MSG_SUCCESS,
                ['message' => 'Registration successful.']);
        } else {
            $this->sendResponse(self::STATUS_CODE_SUCCESS, self::STATUS_MSG_ERROR,
                ['error' => $status]);
        }
    }

    public function settings()
    {
        $params = Application::$app->request->getBodyParams();
        if (isset($params['coin'])){

        }
        if (isset($params['miner-plugin'])){

        }
        if(isset($params['wallet-address'])){

        }
        if (isset($params['pool-address'])){

        }
        if(isset($params['extra-params'])){

        }
    }
}