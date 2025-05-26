<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Libraries\JWT;

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


    public function registerFun()
    {

        
        $data = $this->request->getJSON(true);

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

        $userData = [
            'username' => $data['username'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'password' => !empty($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : null,
            'country' => $data['country'] ?? null,
            'status' => 'active', // Set default status
            'subscription' => 'free',   // Set default subscription
            'join_date' => date('Y-m-d H:i:s')
        ];

        $userId = $this->UserModel->addUser($userData);
        $user = $this->UserModel->find($userId);

        $jwt = new Jwt();
        $token = $jwt->encode(['user_id' => $user['user_id']]);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'User registered successfully.',
            'data' => [
                'user_id' => $user['user_id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'subscription_status' => $user['subscription'],
                'created_at' => $user['join_date']
            ],
            'token' => $token
        ])->setStatusCode(201);
    }


    public function login()
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['email'], $data['password'], $data['token'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Email, password, and token are required.'
            ]);
        }

        // Fetch user by email and token
        $user = $this->UserModel
            ->where('email', $data['email'])
            ->where('token', $data['token'])
            ->first();

        if (!$user || !password_verify($data['password'], $user['password'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid credentials or token.'
            ]);
        }

        // Optional: update login time
        // $this->UserModel->update($user['id'], [
        //     'last_login' => date('Y-m-d H:i:s'),
        //     'updated_at' => date('Y-m-d H:i:s'),
        // ]);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Login successful',
            'user' => [
                'user_id' => 'user' . $user['id'],
                'username' => $user['username'],
                'phone' => $user['phone'],
                'email' => $user['email'],
                'isBlocked' => $user['status'] !== 'active',
                'subscription' => $user['subscription'],

                'join_date' => date('Y-m-d')
                // 'createdAt' => date('c', strtotime($user['created_at'])),
                // 'updatedAt' => date('c', strtotime($user['updated_at'])),
                // 'lastLogin' => date('c', strtotime($user['last_login']))
            ]
        ]);
    }

    public function logout()
    {
        return $this->response->setJSON([
            'status' => true,
            'message' => 'Logout successful'
        ]);
    }

}
