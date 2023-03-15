<?php

namespace AnyKey\Server\core;

use AnyKey\Server\controllers\SiteController;
use AnyKey\Server\models\Page;

class Renderer
{
    /**
     * Render a page according to the given arguments.
     * @param Page $page Page object to render.
     * @param array $variables Array of [placeholder => Value] pairs to replace placeholders.
     */
    public function renderPage(Page $page, array $variables = []) :void
    {
        $pageData = $page->getPage();
        foreach (SiteController::$SiteSettings as $placeholder => $value){
            $pageData = str_replace("{{{$placeholder}}}", $value, $pageData);
        }
        if (!empty($variables)){
            foreach ($variables as $placeholder => $value){
                $pageData = str_replace("{{{$placeholder}}}", $value, $pageData);
            }
        }
        echo $pageData;
    }
}