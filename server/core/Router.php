<?php


class Router
{
    public Request $request;
    public Response $response;
    protected static array $routes = [];

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
    public function addGetRoute(string $path, array $callback):void
    {
        self::$routes['get'][$path] = $callback;
    }

    /**
     * Create a new "POST" route.
     * @param string $path - url path for the route.
     * @param array $callback - array of the controller class and name of the relevant page.
     * ex :- [SiteController::class, 'contact']
     */
    public function addPostRoute(string $path, array $callback):void
    {
        self::$routes['post'][$path] = $callback;
    }

    /**
     * When user made a request, request path is refined and call the relevant functions
     * with parameters.
     * @throws NotFoundException throw code 404 exception
     */
    public function resolveRoute():void
    {
        $path = $this->request->getPath();
        $method = $this->request->getMethod();
        $callback = self::$routes[$method][$path] ?? false;
        if ($callback === false){
            throw new NotFoundException();
        }
        if (is_array($callback)){
            $controller = new $callback[0];
            $controller->{$callback[1]}();
        }
    }

}