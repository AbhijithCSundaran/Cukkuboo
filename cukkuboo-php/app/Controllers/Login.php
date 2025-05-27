<?php

namespace App\Controllers;

use App\Models\LoginModel;

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

        if (!$user || !password_verify($data['password'], hash: $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => false,
                'message' => 'Invalid email or password'
            ]);
        }


        $now = date('Y-m-d H:i:s');
        $this->loginModel->update($user['id'], ['last_login' => $now]);


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
                'date' => date('Y-m-d'),
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at'],
                'lastLogin' => $now
            ]
        ]);
    }
    public function loginToken()
    {
        $data = $this->request->getJSON(true);

        if (!isset($data['email'], $data['password'], $data['fcm_token'])) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Email, password, and FCM token are required.'
            ]);
        }

        $user = $this->loginModel->where('email', $data['email'])->first();

        if (!$user || !password_verify($data['password'], $user['password'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => false,
                'message' => 'Invalid email or password'
            ]);
        }

        $now = date('Y-m-d H:i:s');
        $this->loginModel->update($user['id'], [
            'last_login' => $now,
            'fcm_token' => $data['fcm_token'] // store FCM token
        ]);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Login with token successful',
            'user' => [
                'user_id' => 'user' . $user['id'],
                'username' => $user['username'],
                'phone' => $user['phone'],
                'email' => $user['email'],
                'fcm_token' => $data['fcm_token'],
                'isBlocked' => $user['status'] !== 'active',
                'subscription' => $user['subscription'],
                'date' => date('Y-m-d'),
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at'],
                'lastLogin' => $now
            ]
        ]);
    }
}

