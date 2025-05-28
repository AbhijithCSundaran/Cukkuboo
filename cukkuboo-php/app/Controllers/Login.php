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

       
        $user = $this->loginModel->where('email', $data['email'])->first();

       
        if (!$user || !password_verify($data['password'], $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => false,
                'message' => 'Invalid email or password'
            ]);
        }

        
        $jwt = new Jwt();
        $token = $jwt->encode(['user_id' => $user['user_id']]);

        $now = date('Y-m-d H:i:s');

        
        $updateData = [
            'last_login' => $now,
            'jwt_token' => $token,
        ];

        
        if (!empty($data['fcm_token'])) {
            $updateData['fcm_token'] = $data['fcm_token'];
        }

        
        $this->loginModel->update($user['user_id'], $updateData);
        $this->UserModel->update($user['user_id'], ['jwt_token' => $token]);
        
        return $this->response->setJSON([
            'status' => true,
            'message' => 'Login successful',
            'user' => [
                'user_id' => 'user' . $user['user_id'],
                'username' => $user['username'],
                'phone' => $user['phone'],
                'email' => $user['email'],
                'fcm_token' => $updateData['fcm_token'] ?? null,
                'isBlocked' => $user['status'] !== 'active',
                'subscription' => $user['subscription'],
                'date' => date('Y-m-d'),
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at'],
                'lastLogin' => $now,
                'jwt_token'    => $data['jwt_token']
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