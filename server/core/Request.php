<?php


class Request
{
    /**
     * Returns the base path of the requested url.
     * ex:- "/contact?id=1" => "/contact"
     * @return string base path
     */
    public function getPath() : string
    {
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        $position = strpos($path, '?');

        if ($position === false) {
            return $path;
        }
        return substr($path, 0, $position);
    }

    /**
     * Returns the parsed parameters as an array of [key => value] scheme.
     * @return array body of the request.
     */
    public function getBodyParams() : array
    {
        $body = [];
        if ($this->getMethod() === 'get') {
            foreach ($_GET as $key => $value) {
                $body[$key] = filter_input(INPUT_GET, $key, FILTER_SANITIZE_SPECIAL_CHARS);
            }
        }
        if ($this->getMethod() === 'post') {
            foreach ($_POST as $key => $value) {
                $body[$key] = filter_input(INPUT_POST, $key, FILTER_SANITIZE_SPECIAL_CHARS);
            }
        }
        return $body;
    }

    /**
     * Returns the method of the request whether GET or POST.
     * @return string method of the request
     */
    public function getMethod() : string
    {
        return strtolower($_SERVER['REQUEST_METHOD']);
    }

    /**
     * Returns true if called method is GET, otherwise returns false
     * @return boolean true|false
     */
    public function isGet() : bool
    {
        return $this->getMethod() === 'get';
    }

    /**
     * Returns true if called method is POST, otherwise returns false
     * @return boolean true|false
     */
    public function isPost() : bool
    {
        return $this->getMethod() === 'post';
    }


}