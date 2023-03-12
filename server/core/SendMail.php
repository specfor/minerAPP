<?php

class SendMail
{

    private string $senderEmail = '';
    private string $replyToEmail = '';
    private string $receiverEmail = '';
    private string $subject = '';
    private string $message = '';
    private array $headers;
    private bool $isHTMl;

    public function __construct(string $receiverEmail, string $senderEmail,
                                string $subject, string $message, string $replyToEmail = '')
    {
        $this->receiverEmail = $receiverEmail;
        $this->senderEmail = $senderEmail;
        $this->subject = $subject;
        $this->message = $message;
        $this->replyToEmail = $replyToEmail;
    }

    private function craftHeaders(): void
    {
        if ($this->isHTMl) {
            $this->headers[] = 'MIME-Version: 1.0';
            $this->headers[] = 'Content-type: text/html; charset=iso-8859-1';
        }
        $this->headers[] = 'From: ' . $this->senderEmail;
        $this->headers[] = 'X-Mailer: PHP/' . phpversion();
        if ($this->replyToEmail) {
            $this->headers[] = 'Reply-To: ' . $this->replyToEmail;
        }
    }

    public function sendMail(bool $isHTML = false)
    {
        $this->isHTMl = $isHTML;

        $this->craftHeaders();
        if ($this->headers)
            return mail($this->receiverEmail, $this->subject, $this->message, implode("\r\n", $this->headers));
        else
            return mail($this->receiverEmail, $this->subject, $this->message);
    }
}