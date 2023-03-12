<?php


class Page
{
    public const DEFAULT_HEADER_WITH_MENU = 'default';
    public const BLANK_HEADER = 'blank';
    public const DEFAULT_FOOTER = 'default';
    public const BLANK_FOOTER = 'blank';
    public const DEFAULT_BODY = 'home';
    public const ERROR_PAGE = 'errorPage';

    private string $header;
    private string $footer;
    private string $body;

    /**
     * Create a HTML page with the relevant tags.
     * Can be used to get dynamically rendered HTML elements.
     * @param string $header Header template name to be used. Can use predefined constants.
     * @param string $footer Footer template name to be used. Can use predefined constants.
     * @param string $body Body template name to be used. Can use predefined constants.
     * @param string $title Append to the beginning of the title. If 'Contact' is passed,
     *                      title is changed to 'Contact - site title'
     */
    public function __construct(string $header = 'default',
                                string $footer = 'default', string $body = 'home', string $title = '')
    {
        $this->header = $header;
        $this->footer = $footer;
        $this->body = $body;
        if ($title)
            SiteController::appendToTitle($title);

        if ($_SESSION[Session::FLASH_KEY]){
            foreach (Application::$app->session->getAllFlashMessages() as $flash){
                $this->addAlertMessage($flash['message'], $flash['type']);
            }
        }
    }

    const ALERT_TYPE_INFO = 'alert-primary';
    const ALERT_TYPE_SUCCESS = 'alert-success';
    const ALERT_TYPE_ERROR = 'alert-danger';

    private array $alertMessages = [];

    /**
     * Add an alert message on the top of the page. If called multiple times, add alert messages in the called order.
     * @param string $alertMessage Message to show. Message may contain HTML elements.
     * @param string $alertType One of the alert types defined inside the class.
     *      ALERT_TYPE_INFO | ALERT_TYPE_SUCCESS | ALERT_TYPE_ERROR
     * @param bool $dismissible Whether the alert message is closable.
     */
    public function addAlertMessage(string $alertMessage, string $alertType = self::ALERT_TYPE_INFO,
                                    bool   $dismissible = true): void
    {
        $msg = '<div class="alert ' . $alertType;
        if ($dismissible) {
            $msg .= ' alert-dismissible fade show';
        }
        $msg .= '" style="margin:25px" role="alert">' . $alertMessage;
        if ($dismissible) {
            $msg .= '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
        }
        $msg .= '</div>';
        array_push($this->alertMessages, $msg);
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
        if (!empty($this->alertMessages)){
            foreach ($this->alertMessages as $message){
                echo $message;
            }
        }
        include_once $this->getBodyPath();
        include_once $this->getFooterPath();
        return ob_get_clean();
    }
}