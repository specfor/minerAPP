<?php

namespace AnyKey\Server\core;

class Response
{
    /**
     * Set the status-code of the response to the code passed.
     */
    public function setStatusCode(int $code) : void
    {
        http_response_code($code);
    }

    /**
     * Redirect user to the given path
     */
    public function redirect(string $url) : void
    {
        header("Location: " . $url);
    }
}