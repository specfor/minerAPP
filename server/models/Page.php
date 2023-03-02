<?php


class Page
{
    public const DEFAULT_HEADER_WITH_MENU = 'default';
    public const BLANK_HEADER = 'blank';
    public const DEFAULT_FOOTER = 'default';
    public const BLANK_FOOTER = 'blank';
    public const DEFAULT_BODY = 'home';

    private string $header;
    private string $footer;
    private string $body;

    /**
     * Create a HTML page with the relevant tags.
     * Can be used to get dynamically rendered HTML elements.
     * @param string $header Header template name to be used. Can use predefined constants.
     * @param string $footer Footer template name to be used. Can use predefined constants.
     * @param string $body Body template name to be used. Can use predefined constants.
     */
    public function __construct(string $header = 'default',
                                string $footer = 'default', string $body = 'home')
    {
        $this->header = $header;
        $this->footer = $footer;
        $this->body = $body;
    }

    private function getHeaderPath(): string
    {
        return Application::$ROOT_DIR . "/view/headers/$this->header.php";
    }

    private function getFooterPath(): string
    {
        return Application::$ROOT_DIR . "/view/footers/$this->footer.php";
    }

    private function getBodyPath(): string
    {
        return Application::$ROOT_DIR . "/view/$this->body.php";
    }

    /**
     * @return string complete HTML page with placeholders
     */
    public function getPage(): string
    {
        ob_start();
        include_once $this->getHeaderPath();
        include_once $this->getBodyPath();
        include_once $this->getFooterPath();
        return ob_get_clean();
    }
}