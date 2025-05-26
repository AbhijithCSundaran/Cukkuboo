<?php

namespace App\Controllers;

use App\Models\LoginModel;

class Login extends BaseController
{
    protected $LoginModel;

    public function __construct()
    {
        $this->LoginModel = new LoginModel();
    }

    public function index(): string
    {
        return view('welcome_message');
    }

    public function login()
    {
        $data = $this->request->getJSON(true);

        // Check required fields: email, password, and token
        if (!isset($data['email'], $data['password'], $data['token'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Email, password, and token are required.'
            ]);
        }

        // Fetch user by email and token from LoginModel (make sure the model has this table and fields)
        $user = $this->LoginModel
            ->where('email', $data['email'])
            ->where('token', $data['token'])
            ->first();

        // Validate user existence and password
        if (!$user || !password_verify($data['password'], $user['password'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid credentials or token.'
            ]);
        }

        // Return successful login response
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
                'join_date' => date('Y-m-d'),
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
