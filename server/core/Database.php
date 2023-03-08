<?php

class Database
{
    /** Database name */
    protected const DB_NAME = 'minerapp_database';

    protected static string $servername;
    protected static string $username;
    protected static string $password;

    public PDO $pdo;


    function __construct($servername, $username, $password)
    {
        self::$servername = $servername;
        self::$username = $username;
        self::$password = $password;

        try {
            // Try to connect to mysql service.
            $this->pdo = new PDO("mysql:host=$servername", $username, $password);
        }catch (PDOException $e) {
            $errPage = new Page(Page::BLANK_HEADER, Page::BLANK_FOOTER,
                Page::ERROR_PAGE, 'Internal Server Error');
            Application::$app->renderer->renderPage($errPage,
                ['errorPage:err-message' => 'Internal Server Error occurred.']);
            exit();
        }

        try {
           $this->connectDatabase();
            // set the PDO error mode to exception
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            // This part runs when there is no database.
            $this->createDatabase();
        }
    }

    /**
     * Set class instance pdo object to the pdo object with database connection.
     */
    protected function connectDatabase(){
        // Try to connect to the relevant database.
        $this->pdo = new PDO("mysql:host=".self::$servername.";dbname=" . self::DB_NAME,
            self::$username, self::$password);
    }

    /**
     * Create the database and tables.
     */
    private function createDatabase()
    {
        $sql = "CREATE DATABASE " . self::DB_NAME;
        $this->pdo->exec($sql);

        // Connect to newly created database.
        $this->connectDatabase();

        $sql = "CREATE TABLE users (
                    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    username varchar(255) NOT NULL,
                    email varchar(255) NOT NULL,
                    firstname varchar(255) NOT NULL,
                    lastname varchar(255) NOT NULL,
                    password varchar(255) NOT NULL,
                    role int(5) NOT NULL
                    )";
        $this->pdo->exec($sql);
    }
}
