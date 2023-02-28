<?php


class Router
{
    public Request $request;
    public Response $response;
    protected array $routes = [];

    public function __construct(Request $request, Response $response)
    {
        $this->request = $request;
        $this->response = $response;
    }

    public function addGetRoute($path, $callback)
    {
        $this->routes['get'][$path] = $callback;
    }

    public function addPostRoute($path, $callback)
    {
        $this->routes['post'][$path] = $callback;
    }

    public function resolveRoute(){
//        todo: do the relevant things according to the url
    }

}