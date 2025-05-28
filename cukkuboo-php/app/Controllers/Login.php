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
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Email and password are required.'
            ]);
        }

        $user = $this->loginModel->where('email', $data['email'])->first();

        if (!$user || !password_verify($data['password'], $user['password'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid email or password.'
            ]);
        }

        // Generate new JWT token
        $jwt = new Jwt();
        $token = $jwt->encode(['user_id' => $user['user_id']]);
        $now = date('Y-m-d H:i:s');

        // Update login info
        $this->loginModel->update($user['user_id'], [
            'jwt_token' => $token,
            'last_login' => $now
        ]);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Login successful',
            'user' => [
                'user_id' => 'user' . $user['user_id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'jwt_token' => $token,
                'lastLogin' => $now
            ]
        ]);
    }

    public function logout()
    {
        // Clear all tokens from all users (or apply condition if needed)
        $this->loginModel->updateAllTokensNull();

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Logout successful.'
        ]);
    }
}
