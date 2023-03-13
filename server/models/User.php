<?php

namespace AnyKey\Server\models;

use AnyKey\Server\core\Application;
use PDO;

class User extends DbModel
{

    // Following constants need to be initialized. They are used when executing Database actions.

    private const TABLE_NAME = 'users';
    private const PRIMARY_KEY = 'id';
    private const TABLE_COLUMNS = ['id', 'username', 'email', 'firstname', 'lastname', 'password', 'role'];

    // User Roles
    public const ROLE_ADMINISTRATOR = 1;
    public const ROLE_USER = 2;

    public int $userId;
    public string $username;
    public string $firstname;
    public string $lastname;
    public string $email;
    public string $role;


    /**
     * Generate a password hash.
     * @param string $password String Password
     * @return string Hashed password string
     */
    private static function generatePasswordHash(string $password): string
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    // Password Requirements
    private const MAX_PASSWORD_LENGTH = 24;
    private const MIN_PASSWORD_LENGTH = 8;

    /**
     * Create a new user in the database.
     * @param array $params An array of [key=> value] pairs.
     * @return bool True if success, False if failed.
     */
    public function createNewUser(array $params): bool
    {
        $errorFree = true;

        // Performing checks on input variables.

        $statement = self::getDataFromTable(['id'], self::TABLE_NAME, 'username=:username',
            [':username' => $params['username']]);
        if ($statement->fetch(PDO::FETCH_ASSOC)) {
            $errorFree = false;
            Application::$app->session->setFlashMessage('registerError',
                'Username already exists.', Page::ALERT_TYPE_ERROR);
        }

        $statement = self::getDataFromTable(['id'], self::TABLE_NAME, 'email=:email',
            [':email' => $params['email']]);
        if ($statement->fetch(PDO::FETCH_ASSOC)) {
            $errorFree = false;
            Application::$app->session->setFlashMessage('registerError',
                'Email already exists.', Page::ALERT_TYPE_ERROR);
        }

        if ($params['password'] !== $params['confirmPassword']) {
            $errorFree = false;
            Application::$app->session->setFlashMessage('registerError',
                'Password and confirm password fields do not match.', Page::ALERT_TYPE_ERROR);
        }

        if (strlen($params['password']) < self::MIN_PASSWORD_LENGTH) {
            $errorFree = false;
            Application::$app->session->setFlashMessage('registerError',
                'Password is too short.', Page::ALERT_TYPE_ERROR);
        }

        if (strlen($params['password']) > self::MAX_PASSWORD_LENGTH) {
            $errorFree = false;
            Application::$app->session->setFlashMessage('registerError',
                'Password is too long.', Page::ALERT_TYPE_ERROR);
        }
        $params['password'] = self::generatePasswordHash($params['password']);

        //For now set user role to 1
        $params['role'] = 1;

        if ($errorFree) {
            self::insertIntoTable(self::TABLE_NAME, self::TABLE_COLUMNS, $params);
            return true;
        }
        return false;
    }

    /**
     * If passed user ID is present, set instance variable values.
     * @param int $userID User ID to look for
     * @return bool True if user is present, false otherwise.
     */
    public function loadUserData(int $userID): bool
    {
        $statement = self::getDataFromTable(['*'], 'users', "id=" . $userID);
        $userData = $statement->fetchAll()[0];
        if ($userData) {
            $this->userId = $userData['id'];
            $this->username = $userData['username'];
            $this->email = $userData['email'];
            $this->firstname = $userData['firstname'];
            $this->lastname = $userData['lastname'];
            $this->role = $userData['role'];
            return true;
        }
        return false;
    }

    /**
     * Validate the user login.
     * @param string $username Username / Email of the user.
     * @param string $password Password of the user.
     * @return bool|int Return userId if user exists, false if not.
     */
    public function validateUser(string $username, string $password): bool|int
    {
        $sql = "SELECT id, password FROM " . self::TABLE_NAME . " WHERE username=:username OR email=:username";
        $statement = self::prepare($sql);
        $statement->bindValue(':username', $username);
        $statement->execute();
        $data = $statement->fetch(PDO::FETCH_ASSOC);
        if ($data) {
            if (password_verify($password, $data['password'])) {
                return $data['id'];
            }
        }
        return false;
    }

    /**
     * Get user type text.
     * @return string Return user type message. 'none' if no role found.
     */
    public function getUserRoleText(): string
    {
        if ($this->userId == User::ROLE_ADMINISTRATOR)
            return 'admin';
        elseif ($this->userId == User::ROLE_USER)
            return 'user';
        else
            return 'none';
    }
}