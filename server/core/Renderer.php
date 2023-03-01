<?php


class Renderer
{
    /**
     * Render a page according to the given arguments.
     * @param Page $page Page object to render.
     */
    public function renderPage(Page $page, array $variables = [])
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