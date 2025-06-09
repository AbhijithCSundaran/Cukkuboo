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
            return $this->response->setStatusCode(200)->setJSON([
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
                'phone' => $user['phone'],
                'email' => $user['email'],
                'isBlocked' => $user['status'] !== 'active',
                'subscription' => $user['subscription'],
                'user_type' => $user['user_type'],
                'date' => date('Y-m-d'),
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at'],
                'lastLogin' => $now,
                'jwt_token'=>$token
            ]
        ]);
    }

    // public function logout()
    // {
    //     // Clear all tokens from all users (or apply condition if needed)
    //     $this->loginModel->updateAllTokensNull();

    //     return $this->response->setJSON([
    //         'status' => true,
    //         'message' => 'Logout successful.'
    //     ]);
    // }
    public function logout()
{
    $authHeader = $this->request->getHeaderLine('Authorization');

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Authorization token missing or invalid.'
        ]);
    }

    $token = $matches[1];

    // Find user by token
    $user = $this->loginModel->where('jwt_token', $token)->first();

    if (!$user) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Invalid token or user not found.'
        ]);
    }

    // Clear the token from the DB
    $this->loginModel->update($user['user_id'], ['jwt_token' => null]);

    return $this->response->setJSON([
        'status' => true,
        'message' => 'Logout successful. Token removed.'
    ]);
}
 public function sendOtp()
{
    $data = $this->request->getJSON(true);

    if (empty($data['email'])) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Email is required.'
        ]);
    }

    $user = $this->loginModel->where('email', $data['email'])->first();

    if (!$user) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'User not found.'
        ]);
    }

    $otp = rand(100000, 999999);
    $otpString = (string) $otp;

    // Check if current value is different before updating
    if ($user['password'] !== $otpString) {
        $update = ['password' => $otpString];
        $this->loginModel->update($user['user_id'], ['password' => $otpString]);

    }


    // Send OTP via email
    $emailService = \Config\Services::email();
    $emailService->setTo($data['email']);
    $emailService->setSubject('Password Reset OTP');
    $emailService->setMessage("Your OTP for resetting your password is: <b>$otp</b>");

    if ($emailService->send()) {
        return $this->response->setJSON([
            'status' => true,
            'message' => 'OTP sent to your email.'
        ]);
    } else {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Failed to send OTP email.'
        ]);
    }
}

public function resetPassword()
{
    $data = $this->request->getJSON(true);

    if (empty($data['email']) || empty($data['otp']) || empty($data['new_password'])) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Email, OTP, and new password are required.'
        ]);
    }

    $user = $this->loginModel->where('email', $data['email'])->first();

    if (!$user || $user['password'] !== $data['otp']) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Invalid OTP or email.'
        ]);
    }

    $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);

    // Only update if new password is different from current password (which is OTP right now)
    if ($user['password'] !== $hashedPassword) {
        $this->loginModel->update($user['user_id'], ['password' => $hashedPassword]);
    }

    return $this->response->setJSON([
        'status' => true,
        'message' => 'Password reset successful.'
    ]);
}
}