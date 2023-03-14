<?php

namespace AnyKey\Server\models;

use AnyKey\Server\core\Application;
use PDOException;
use PDOStatement;

abstract class DbModel
{
    /**
     * Prepare sql statement
     * @param string $sql SQL statement to prepare
     * @return PDOStatement|PDOException|bool PDOStatement if success, PDOException or false if any error occurred.
     */
    protected static function prepare(string $sql): PDOStatement|PDOException|bool
    {
        return Application::$app->db->pdo->prepare($sql);
    }

    protected static function exec(string $sql): false|int
    {
        return Application::$app->db->pdo->exec($sql);
    }

    /**
     * Insert data into table. There must be a <b>TABLE_NAME</b> constant defining the relevant table name
     * in the Class definition.
     * @param string $tableName Name of the table where to insert data.
     * @param array $tableColumns Array of table columns where to insert data.
     * @param array $params An array of placeholder=>value pairs.
     * @return bool True if success in inserting to table.False if any error.
     */
    protected static function insertIntoTable(string $tableName,array $tableColumns, array $params): bool
    {
        // Check whether all the keys passed here are real column names as user passed request data is passed to this.
        $attributes = [];
        $values = [];
        foreach ($params as $key => $value) {
            if (in_array($key, $tableColumns)) {
                $attributes[] = $key;
                $values[] = $value;
            }
        }
        $placeholders = array_map(fn($attr) => ":$attr", $attributes);
        $statement = self::prepare("INSERT INTO $tableName (" . implode(',', $attributes) .
            ") VALUES (" . implode(',', $placeholders) . ")");
        for ($i = 0; $i < count($placeholders); $i++) {
            $statement->bindValue($placeholders[$i], $values[$i]);
        }
        return $statement->execute();
    }

    /**
     * Retrieve data from the given table
     * @param array $rows Array of row names of which should be returned.
     * @param string $tableName Table name from where to get data.
     * @param string $conditionWithPlaceholders The condition to get data with placeholders(if needed) to values.
     *      Should be a valid sql condition.
     * @param array $placeholderValues Associative array of placeholder => value.
     * @return bool|PDOStatement|PDOException Return PDOStatement|PDOException|bool based on scenario.
     */
    protected static function getDataFromTable(array $rows, string $tableName, string $conditionWithPlaceholders = '',
                                     array $placeholderValues = []): bool|PDOStatement|PDOException
    {
        if ($conditionWithPlaceholders)
            $sql = "SELECT " . implode(', ', $rows) . " FROM $tableName WHERE $conditionWithPlaceholders";
        else
            $sql = "SELECT " . implode(', ', $rows) . " FROM $tableName";
        $statement = self::prepare($sql);
        if ($conditionWithPlaceholders && !empty($placeholderValues)){
            foreach ($placeholderValues as $placeholder=>$value){
                $statement->bindValue($placeholder, $value);
            }
        }
        $statement->execute();
        return $statement;
    }
}