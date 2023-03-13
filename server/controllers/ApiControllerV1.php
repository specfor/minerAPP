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
            $userId = $user->validateUser($params['email/username'], $params['password']);
            if ($userId) {
                $user->loadUserData($userId);
                $payload = [
                    'id' => $user->userId,
                    'email'=> $user->email,
                    'role'=>$user->getUserRoleText(),
                    'exp' => Carbon::now()->addSeconds(self::JWT_EXPIRE_INTERVAL)
                ];
                $jwt = JWT::generateToken($payload);
                $returnPayload = [
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
}