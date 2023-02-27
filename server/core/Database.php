<?php

class Database
{
    public PDO $pdo;

    function __construct($servername, $dbname, $username, $password)
    {
        try {
            $this->pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
            // set the PDO error mode to exception
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
        }
    }

    public function prepare($sql)
    {
        return $this->pdo->prepare($sql);
    }
}
