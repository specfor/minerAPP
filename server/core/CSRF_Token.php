<?php

namespace AnyKey\Server\core;

class CSRF_Token
{
    /**
     * Generate a CSRF token. Tokens are stored in memory. Remove them after use.
     * @param string $url Path where token is going to be used. This is to make sure creation of url specific tokens.
     *      Otherwise, token created for other paths may be used to verify CSRF token check leading to security issues.
     * @return string CSRF token.
     */
    public static function generateToken(string $url): string
    {
        $token = hash("sha256", uniqid());
        Application::$app->session->setVariable($url, $token);
        return $token;
    }

    /**
     * Validate the CSRF token.
     * @param string $url Path where the token is used.
     * @param string $token CSRF token
     * @return bool True if valid token for specified path, False if not.
     */
    public static function validateToken(string $url, string $token): bool
    {
        if (Application::$app->session->getVariable($url) === $token) {
            return true;
        }
        return false;
    }

    /**
     * Remove the token from memory.
     * @param string $url Path where the token is used.
     */
    public static function removeToken(string $url): void
    {
        Application::$app->session->removeVariable($url);
    }
}