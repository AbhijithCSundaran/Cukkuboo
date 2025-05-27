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

    // Check required fields: email and password only
    if (!isset($data['email'], $data['password'])) {
        return $this->response->setStatusCode(400)->setJSON([
            'status' => false,
            'message' => 'Email and password are required.',
            'user' => null
        ]);
    }

    // Fetch user by email only
    $user = $this->LoginModel
        ->where('email', $data['email'])
        ->first();

    // Validate user and password
    if (!$user || !password_verify($data['password'], $user['password'])) {
        return $this->response->setStatusCode(401)->setJSON([
            'status' => false,
            'message' => 'Invalid email or password.',
            'user' => null
        ]);
    }

    // Update last login
    $this->LoginModel->update($user['id'], [
        'last_login' => date('Y-m-d H:i:s')
    ]);

    // Success response
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
            'createdAt' => $user['created_at'] ?? null,
            'updatedAt' => $user['updated_at'] ?? null,
            'lastLogin' => date('Y-m-d H:i:s')
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
