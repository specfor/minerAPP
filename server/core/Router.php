<?php


class Router
{
    public Request $request;
    public Response $response;
    protected array $routes = [];

    /**
     * Create a new Router instance
     * @param Request $request instance of Request class
     * @param Response $response instance of Response class
     */
    public function __construct(Request $request, Response $response)
    {
        $this->request = $request;
        $this->response = $response;
    }

    /**
     * Create a new "GET" route.
     * @param string $path path for the route.
     * @param array $callback array of the controller class and name of the relevant page.
     * ex :- [SiteController::class, 'home']
     */
    public function addGetRoute(string $path, array $callback)
    {
        $this->routes['get'][$path] = $callback;
    }

    /**
     * Create a new "POST" route.
     * @param string $path - url path for the route.
     * @param array $callback - array of the controller class and name of the relevant page.
     * ex :- [SiteController::class, 'contact']
     */
    public function addPostRoute(string $path, array $callback)
    {
        $this->routes['post'][$path] = $callback;
    }

    /**
     * When user made a request, request path is refined and call the relevant functions
     * with parameters.
     */
    public function resolveRoute(){
//        todo: do the relevant things according to the url
    }

}