<?php

namespace App\Controllers;

use App\Models\LoginModel;
use App\Libraries\Jwt;

class Login extends BaseController
{
    protected $loginModel;

    public function __construct()
    {
        $this->loginModel = new LoginModel();
    }

    public function loginFun()
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Email and password are required.'
            ]);
        }

        $user = $this->loginModel->findUserByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => false,
                'message' => 'Invalid email or password'
            ]);
        }

        // Generate JWT token
        $jwt = new Jwt();
        $token = $jwt->encode(['user_id' => $user['user_id']]);
        $now = date('Y-m-d H:i:s');

        // Prepare update data
        $updateData = [
            'last_login' => $now,
            'jwt_token' => $token,
        ];

        // If fcm_token is provided, store it
        if (!empty($data['fcm_token'])) {
            $updateData['fcm_token'] = $data['fcm_token'];
        }

        $this->loginModel->updateLoginData($user['user_id'], $updateData);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Login successful',
            'user' => [
                'user_id' => 'user' . $user['user_id'],
                'username' => $user['username'],
                'phone' => $user['phone'],
                'email' => $user['email'],
                'isBlocked' => $user['status'] !== 'active',
                'subscription' => $user['subscription'],
                'date' => date('Y-m-d'),
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at'],
                'lastLogin' => $now,
                'jwt_token'=>$user['jwt_token']
            ]
        ]);
    }

    public function logout()
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['email'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Email is required to logout.'
            ]);
        }

        $user = $this->loginModel->findUserByEmail($data['email']);

        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'User not found.'
            ]);
        }

        // Generate a new JWT to invalidate old one
        $jwt = new Jwt();
        $newToken = $jwt->encode(['user_id' => $user['user_id'], 'logout' => true]);

        $this->loginModel->updateLoginData($user['user_id'], [
            'jwt_token' => $newToken
        ]);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Logout successful. Token has been updated.'
        ]);
    }
}
