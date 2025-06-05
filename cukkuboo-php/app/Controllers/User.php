<?php


namespace App\Controllers;

use App\Models\UserModel;
use App\Libraries\Jwt;
use CodeIgniter\API\ResponseTrait;  // <-- add this

class User extends BaseController
{
    use ResponseTrait; // <-- add this

    protected $UserModel;

    public function __construct()
    {
        $this->UserModel = new UserModel();
    }

    // rest of your code...


// namespace App\Controllers;

// use App\Models\UserModel;
// use App\Libraries\Jwt;

// class User extends BaseController
// {
//     protected $UserModel;

//     public function __construct()
//     {
//         $this->UserModel = new UserModel();
//     }

    public function index(): string
    {
        return view('welcome_message');
    }

    //Register new user
    // public function registerFun()
    // {
    //     $data = $this->request->getJSON(true);

    //     if (empty($data['phone']) && empty($data['email'])) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Phone or email is required.'
    //         ])->setStatusCode(400);
    //     }

    //     if ($this->UserModel->isUserExists($data['phone'] ?? null, $data['email'] ?? null)) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'User already exists.'
    //         ])->setStatusCode(409);
    //     }

    //     $userData = [
    //         'username'     => $data['username'] ?? null,
    //         'phone'        => $data['phone'] ?? null,
    //         'email'        => $data['email'] ?? null,
    //         'password'     => !empty($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : null,
    //         'country'      => $data['country'] ?? null,
    //         'status'       => 'active',
    //         'subscription' => 'free',
    //         'user_type' => $data['user_type'] ??'Customer',
    //         'join_date'    => date('Y-m-d H:i:s')
    //     ];

    //     $userId = $this->UserModel->addUser($userData);
    //     $user   = $this->UserModel->find($userId);

    //     $jwt    = new Jwt();
    //     $token  = $jwt->encode(['user_id' => $user['user_id']]);

    //     $this->UserModel->update($user['user_id'], ['jwt_token' => $token]);

    //     return $this->response->setJSON([
    //         'status'  => true,
    //         'message' => 'User registered successfully.',
    //         'data'    => [
    //             'user_id'             => $user['user_id'],
    //             'username'            => $user['username'],
    //             'email'               => $user['email'],
    //             'phone'               => $user['phone'],
    //             'subscription_status' => $user['subscription'],
    //             'user_type'           => $user['user_type'],
    //             'created_at'          => $user['join_date'],
    //             'jwt_token'           => $token
    //         ]
    //     ])->setStatusCode(201);
    // }

    // // Auth helper
    public function getAuthenticatedUser()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = trim(str_replace('Bearer', '', $authHeader));

        try {
            $jwt     = new Jwt();
            $payload = $jwt->decode($token);
            $userId  = $payload->user_id ?? null;

            $user = $this->UserModel->find($userId);

            if (!$user || $user['jwt_token'] !== $token) {
                return null;
            }

            return $user;

        } catch (\Exception $e) {
            return null;
        }
    }

    public function storeByJwt()
{
    $user = $this->getAuthenticatedUser(); // Get user from JWT
    $data = $this->request->getJSON(true);

     $userData = [
            'username'     => $data['username'] ?? null,
            'phone'        => $data['phone'] ?? null,
            'email'        => $data['email'] ?? null,
            'password'     => !empty($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : null,
            'country'      => $data['country'] ?? null,
            'status'       => 'active',
            'subscription' => 'free',
            'join_date'    => date('Y-m-d H:i:s')
        ];


    if (!empty($data['password'])) {
        $userData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    }

    if ($user) {
        // Update existing user
        $this->UserModel->updateUser($user['user_id'], $userData);

        return $this->respond([
            'status'  => true,
            'message' => 'User updated successfully (JWT).',
            'data'    => $this->UserModel->find($user['user_id'])
        ]);
    } else {
        // Create new user
        if ($this->UserModel->isUserExists($userData['phone'], $userData['email'])) {
            return $this->failValidationErrors('User already exists.');
        }

        $userData['join_date'] = date('Y-m-d H:i:s');
        $newUserId = $this->UserModel->addUser($userData);

        // Generate and store JWT
        $jwt = new Jwt();
        $token = $jwt->encode(['user_id' => $newUserId]);
        $this->UserModel->update($newUserId, ['jwt_token' => $token]);

        return $this->respondCreated([
            'status'  => true,
            'message' => 'User created successfully (JWT).',
            'data'    => array_merge($this->UserModel->find($newUserId), ['jwt_token' => $token])
        ]);
    }
}


    // Update user details
    // public function updateUser()
    // {
    //     $user = $this->getAuthenticatedUser();

    //     if (!$user) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Unauthorized'
    //         ])->setStatusCode(401);
    //     }

    //     $data = $this->request->getJSON(true);

    //     $updateData = array_filter([
    //         'username' => $data['username'] ?? null,
    //         'phone'    => $data['phone'] ?? null,
    //         'email'    => $data['email'] ?? null,
    //         'country'  => $data['country'] ?? null
    //     ]);

    //     if (!empty($data['password'])) {
    //         $updateData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    //     }

    //     $this->UserModel->updateUser($user['user_id'], $updateData);

    //     return $this->response->setJSON([
    //         'status' => true,
    //         'message' => 'User updated successfully.'
    //     ]);
    // }

    //  Delete user
    public function deleteUser()
    {
        $user = $this->getAuthenticatedUser();

        if (!$user) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Unauthorized'
            ])->setStatusCode(401);
        }

        $this->UserModel->deleteUser($user['user_id']);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'User deleted successfully.'
        ]);
    }
    // Get user details by user_id
public function getUserDetailsById($userId)
{
    $user = $this->UserModel->getUserById($userId);

    if (!$user) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'User not found'
        ])->setStatusCode(404);
    }

    return $this->response->setJSON([
        'status' => true,
        'data' => $user
    ]);
}

// Update user details by user_id
// 
public function storeById()
{
    $data   = $this->request->getJSON(true);
    $userId = $data['user_id'] ?? null;

    $userData = [
        'username'     => $data['username'] ?? null,
        'phone'        => $data['phone'] ?? null,
        'email'        => $data['email'] ?? null,
        'country'      => $data['country'] ?? null,
        'user_type'    => $data['user_type'] ?? 'Customer',
        'subscription' => $data['subscription'] ?? 'free',
        'status'       => $data['status'] ?? 'active',
    ];

    if (!empty($data['password'])) {
        $userData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    }

    if (empty($userId)) {
        // Create new user
        if ($this->UserModel->isUserExists($userData['phone'], $userData['email'])) {
            return $this->failValidationErrors('User already exists.');
        }

        $userData['join_date'] = date('Y-m-d H:i:s');
        $newUserId = $this->UserModel->addUser($userData);

        return $this->respondCreated([
            'status'  => true,
            'message' => 'User created successfully.',
            'data'    => $this->UserModel->find($newUserId)
        ]);
    } else {
        // Update existing user
        $existingUser = $this->UserModel->find($userId);
        if (!$existingUser) {
            return $this->failNotFound('User not found.');
        }

        $this->UserModel->updateUser($userId, $userData);

        return $this->respond([
            'status'  => true,
            'message' => 'User updated successfully.',
            'data'    => $this->UserModel->find($userId)
        ]);
    }
}


// Delete user by user_id
public function deleteUserById($userId)
{
    $user = $this->UserModel->getUserById($userId);

    if (!$user) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'User not found'
        ])->setStatusCode(404);
    }

    $this->UserModel->deleteUserById($userId);

    return $this->response->setJSON([
        'status' => true,
        'message' => 'User deleted successfully.'
    ]);
}

}
