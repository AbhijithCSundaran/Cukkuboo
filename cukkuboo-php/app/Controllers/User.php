<?php

namespace App\Controllers;

use App\Models\UserModel;

class User extends BaseController
{
    protected $UserModel;

    public function __construct()
    {
        $this->UserModel = new UserModel();
    }

    // Example index method
    public function index()
    {
        return view('welcome_message');
    }

    // Register function for POST /user/register
    public function registerFun()
    {
        // Get JSON input as associative array
        $data = $this->request->getJSON(true);

        if (!$data) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid input.'
            ]);
        }

        // Check if user exists already
        if ($this->UserModel->isUserExists($data['phone'], $data['email'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Email or phone already exists.'
            ]);
        }

        // Insert user
        $insertId = $this->UserModel->addUser($data);

        if ($insertId) {
            return $this->response->setJSON([
                'status' => true,
                'message' => 'User registered successfully.',
                'user_id' => $insertId,
            ]);
        } else {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'User registration failed.'
            ]);
        }
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
