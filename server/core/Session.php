<?php

namespace AnyKey\Server\core;

class Session
{
    public const FLASH_KEY = 'flash_messages';

    public function __construct()
    {
        session_start();
        $flashMessages = $_SESSION[self::FLASH_KEY] ?? [];
        foreach ($flashMessages as $key => &$flashMessage) {
            $flashMessage['remove'] = true;
        }
        $_SESSION[self::FLASH_KEY] = $flashMessages;
    }

    /**
     * Sets a flash message.
     * @param string $key Key of the flash message.
     * @param string $message Message to be stored.
     * @param string $type Type of the flash message. One of the constants in Page class
     *      Page::ALERT_TYPE_INFO | Page::ALERT_TYPE_ERROR | Page::ALERT_TYPE_SUCCESS
     */
    public function setFlashMessage(string $key, string $message, string $type = 'ALERT_TYPE_INFO'): void
    {
        $_SESSION[self::FLASH_KEY][$key] = [
            'remove' => false,
            'message' => $message,
            'type' => $type
        ];
    }

    /**
     * Return the value and the type of the flash message.
     * @param string $key Key to find the flash message.
     * @return array|false Return an array of flash message and type if key is found, false if no key found.
     */
    public function getFlashMessage(string $key): array|false
    {
        if (!$_SESSION[self::FLASH_KEY][$key])
            return false;

        $msg = $_SESSION[self::FLASH_KEY][$key]['message'] ?? false;
        $type = $_SESSION[self::FLASH_KEY][$key]['type'] ?? false;
        return [$msg, $type];
    }

    /**
     * @return array Return array of all flash messages.
     */
    public function getAllFlashMessages(): array
    {
        return $_SESSION[self::FLASH_KEY];
    }

    /**
     * Removes a flash message.
     * @param string $key Key to find the flash message.
     */
    public function removeFlashMessage(string $key): void
    {
        unset($_SESSION[$key]);
    }

    /**
     * Set a session variable
     * @param string $variable Variable name.
     * @param string $value Value to be stored.
     */
    public function setVariable(string $variable, string $value): void
    {
        $_SESSION[$variable] = $value;
    }

    /**
     * Get the value of a session variable.
     * @param string $variable Name of session variable.
     * @return false|mixed Return value if variable is present and false if variable is absent.
     */
    public function getVariable(string $variable): mixed
    {
        return $_SESSION[$variable] ?? false;
    }

    /**
     * Removes a session variable.
     * @param string $variable Variable name to remove
     */
    public function removeVariable(string $variable): void
    {
        unset($_SESSION[$variable]);
    }

    public function __destruct()
    {
        $flashMessages = $_SESSION[self::FLASH_KEY] ?? [];
        foreach ($flashMessages as $key => &$flashMessage) {
            if ($flashMessage['remove']) {
                unset($flashMessages[$key]);
            }
        }
        $_SESSION[self::FLASH_KEY] = $flashMessages;
    }
}