<?php


class Renderer
{
    /**
     * Render a page according to the given arguments
     * @param string $pageType Type of the page
     * @param array $options Options to render the page
     */
    public function renderPage(string $pageType, array $options)
    {
        if ($pageType === 'error') {
            ob_start();
            include_once Application::$ROOT_DIR . '/view/errorPage.php';
            $pageData = ob_get_clean();
            foreach ($options as $key => $value){
                $pageData = str_replace("{{{$key}}}", $value, $pageData);
            }
            echo $pageData;
        }
    }
}