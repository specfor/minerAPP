<?php

namespace AnyKey\Server\models;

abstract class API
{
    public const STATUS_CODE_SUCCESS = 200;
    public const STATUS_CODE_NOTFOUND = 404;
    public const STATUS_CODE_UNAUTHORIZED = 403;

    public const STATUS_MSG_SUCCESS = 'success';
    public const STATUS_MSG_ERROR = 'error';
    public const STATUS_MSG_NOTFOUND = 'not-found';
    public const STATUS_MSG_UNAUTHORIZED = 'unauthorized';

    /**
     * Send JSON formatted crafted response to the called API user.
     * @param int $statusCode Response status code. Can ues one of the constants defined in API.
     * @param string $statusMessage Response status message. Can ues one of the constants defined in API.
     * @param array $payload Payload to encode. Should be a nested array of key=>value pairs.
     */
    public function sendResponse(int $statusCode, string $statusMessage, array $payload): void
    {
        $finalPayload = [
            'statusCode'=> $statusCode,
            'statusMessage'=>$statusMessage,
            'body'=> $payload
        ];
        echo json_encode($finalPayload);
    }
}