<?php

namespace AnyKey\Server\core;

use Carbon\Carbon;

class JWT
{
    private const HASHING_ALGORITHM = 'sha256';

    private static string $hash;
    private static string $header;

    public function __construct()
    {
        self::$hash = $_ENV['JWT_SECRET'];
        self::$header = json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256']);
    }

    /**
     * @param string $text Text to be encoded.
     * @return string Url special chars replaced base64 encoded string.
     */
    public static function base64UrlEncode(string $text): string
    {
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($text)
        );
    }

    /**
     * @param array|string $payload Payload to generate the JWT token.
     * @return string JWT token string.
     */
    public static function generateToken(string $payload): string
    {
        $payload = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode(self::$header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac(self::HASHING_ALGORITHM,
            $base64UrlHeader . "." . $base64UrlPayload, self::$hash, true);

        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Check whether token is valid or not. <b>NOTE</b> This function will not check whether token is expired or not.
     * @param string $jwt JWT token to check
     * @return bool True if valid, False otherwise.
     */
    public static function isValidToken(string $jwt): bool
    {
        $tokenParts = explode('.', $jwt);
        $payload = base64_decode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        $generatedSignature = self::generateToken($payload);
        if ($generatedSignature === $signatureProvided)
            return true;
        return false;
    }

    /**
     * @param string $jwt JWT token to check.
     * @return bool True if expired, False if not
     */
    public static function isExpired(string $jwt):bool{
        $tokenParts = explode('.', $jwt);
        $payload = base64_decode($tokenParts[1]);

        $expiration  = new \DateTime(json_decode($payload)->exp);
        $now = new \DateTime();
        return ($now->diff($expiration) > 0);
    }
}