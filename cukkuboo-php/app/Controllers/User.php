<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Libraries\Jwt;

class User extends BaseController
{
    protected $UserModel;

    public function __construct()
    {
        $this->UserModel = new UserModel();
    }

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
    //             'created_at'          => $user['join_date'],
    //             'jwt_token'           => $token
    //         ]
    //     ])->setStatusCode(201);
    // }

    // // Auth helper
    // public function getAuthenticatedUser()
    // {
    //     $authHeader = $this->request->getHeaderLine('Authorization');
    //     if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
    //         return null;
    //     }

    //     $token = trim(str_replace('Bearer', '', $authHeader));

    //     try {
    //         $jwt     = new Jwt();
    //         $payload = $jwt->decode($token);
    //         $userId  = $payload->user_id ?? null;

    //         $user = $this->UserModel->find($userId);

    //         if (!$user || $user['jwt_token'] !== $token) {
    //             return null;
    //         }

    //         return $user;

    //     } catch (\Exception $e) {
    //         return null;
    //     }
    // }
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

    public function registerFun()
{
    $data = $this->request->getJSON(true);

    // Try to get authenticated user from JWT
    $authenticatedUser = $this->getAuthenticatedUser();

    // Shared user data structure
    $userData = array_filter([
        'username'     => $data['username'] ?? null,
        'phone'        => $data['phone'] ?? null,
        'email'        => $data['email'] ?? null,
        'country'      => $data['country'] ?? null,
        'subscription' => $data['subscription'] ?? 'free',
        'status'       => $data['status'] ?? 'active',
    ]);

    if (!empty($data['password'])) {
        $userData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    }

    // ✅ If NOT authenticated → Register new user
    if (!$authenticatedUser) {
        if (empty($data['phone']) && empty($data['email'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Phone or email is required.'
            ])->setStatusCode(400);
        }

        if ($this->UserModel->isUserExists($data['phone'] ?? null, $data['email'] ?? null)) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'User already exists.'
            ])->setStatusCode(409);
        }

        $userData['join_date'] = date('Y-m-d H:i:s');

        $userId = $this->UserModel->addUser($userData);
        $user   = $this->UserModel->find($userId);

        $jwt   = new Jwt();
        $token = $jwt->encode(['user_id' => $user['user_id']]);

        $this->UserModel->update($user['user_id'], ['jwt_token' => $token]);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'User registered successfully.',
            'data'    => [
                'user_id'             => $user['user_id'],
                'username'            => $user['username'],
                'email'               => $user['email'],
                'phone'               => $user['phone'],
                'subscription_status' => $user['subscription'],
                'created_at'          => $user['join_date'],
                'jwt_token'           => $token
            ]
        ])->setStatusCode(201);
    } 

    // ✅ If authenticated → Update existing user
    else {
        $this->UserModel->updateUser($authenticatedUser['user_id'], $userData);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'User updated successfully.',
            'data' => $userData
        ]);
    }
}


    //  Get user details
    public function getUserDetails()
    {
        $user = $this->getAuthenticatedUser();

        if (!$user) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Unauthorized'
            ])->setStatusCode(401);
        }

        return $this->response->setJSON([
            'status' => true,
            'data' => $user
        ]);
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
public function getUserList()
{
    // Get pagination parameters from the query string
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');

    // If pageIndex is negative, return all users without pagination
    if ($pageIndex < 0) {
        $users = $this->UserModel->getAllUsers();
        $total = count($users);

        return $this->response->setJSON([
            'status' => true,
            'data'   => $users,
            'total'  => $total
        ]);
    }

    // Validate and fallback
    if ($pageSize <= 0) {
        $pageSize = 10; // default size
    }

    // Calculate offset
    $offset = $pageIndex * $pageSize;

    // Get total user count
    $total = $this->UserModel->countAll();

    // Get paginated users
    $users = $this->UserModel
        ->orderBy('user_id', 'DESC')
        ->findAll($pageSize, $offset);

    return $this->response->setJSON([
        'status' => true,
        'data'   => $users,
        'total'  => $total
    ]);
}


}
