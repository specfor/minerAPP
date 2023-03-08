<?php


class User extends DbModel
{
    /**
     * Following constants need to be initialized. They are used when executing Database actions.
     */
    private const TABLE_NAME = 'users';
    private const PRIMARY_KEY = 'id';
    private const TABLE_COLUMNS = ['id', 'username', 'email', 'firstname', 'lastname', 'password', 'role'];


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

    /**
     * Verify Password.
     * @param string $password String password
     * @return bool True if password match with hash. False if not.
     */
    private static function verifyPassword(string $password)
    {
        return password_verify($password, PASSWORD_DEFAULT);
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
            //Todo: Show username already used error
        }

        $statement = self::getDataFromTable(['id'], self::TABLE_NAME, 'email=:email',
            [':email' => $params['email']]);
        if ($statement->fetch(PDO::FETCH_ASSOC)) {
            $errorFree = false;

        }

        if ($params['password'] !== $params['confirmPassword']) {
            $errorFree = false;

        }

        if (strlen($params['password']) < self::MIN_PASSWORD_LENGTH) {
            $errorFree = false;

        }

        if (strlen($params['password']) > self::MAX_PASSWORD_LENGTH) {
            $errorFree = false;

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
     * Set user instance variables from the DATABASE regarding to the <b>SESSION</b> userId.
     * If success, return true.
     * If no SESSION userId is not set or any error occurred then return false.
     */
    public function getUserData(): bool
    {
        if (isset($_SESSION['userId'])) {
            $statement = self::getDataFromTable(['*'], 'users', "id=" . $_SESSION['userId']);
            $userData = $statement->fetchAll()[0];
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

}