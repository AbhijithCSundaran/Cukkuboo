<?php

namespace App\Controllers;

use App\Models\LoginModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;
use App\Config\Email;

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
            'success' => true,
            'message' => 'Email and password are required.',
            'data' => []
        ]);
    }

    $user = $this->loginModel->where('email', $data['email'])->first();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        return $this->response->setStatusCode(200)->setJSON([
            'success' => true,
            'message' => 'Invalid email or password.',
            'data' => []
        ]);
    }

    $now = date('Y-m-d H:i:s');

    $jwt = new Jwt();
    $token = $jwt->encode(['user_id' => $user['user_id']]);
    $updateData = [
        'jwt_token' => $token,
        'last_login' => $now,
    ];
    // Login Type 1: No fcm_token → just return existing token, no update
    if (empty($data['fcm_token'])) {
    $this->loginModel->update($user['user_id'], $updateData);
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Login successful (type 1)',
            'data' => [
            'user_id' =>  $user['user_id'],
            'username' => $user['username'],
            'phone' => $user['phone'],
            'email' => $user['email'],
            'isBlocked' => $user['status'] !== 'active',
            'subscription' => $user['subscription'],
            'user_type' => $user['user_type'],
            // 'date' => date('Y-m-d'),
            'createdAt' => $user['created_at'],
            'updatedAt' => $user['updated_at'],
            'lastLogin' => $now,
            'jwt_token' => $token
            ]
        ]);
    }

    // Login Type 2: Email + Password + fcm_token → update token and fcm_token

    $updateData['fcm_token'] = $data['fcm_token'];
    
    $this->loginModel->update($user['user_id'], $updateData);
    return $this->response->setJSON([
        'success' => true,
        'message' => 'Login successful (type 2)',
        'data' => [
            'user_id' =>  $user['user_id'],
            'username' => $user['username'],
            'phone' => $user['phone'],
            'email' => $user['email'],
            'isBlocked' => $user['status'] !== 'active',
            'subscription' => $user['subscription'],
            'user_type' => $user['user_type'],
            // 'date' => date('Y-m-d'),
            'createdAt' => $user['created_at'],
            'updatedAt' => $user['updated_at'],
            'lastLogin' => $now,
            'jwt_token' => $token,
            'fcm_token' => $data['fcm_token']
        ]
    ]);
}

    public function logout()
    {
    $authHeader = $this->request->getHeaderLine('Authorization');
    $auth = new AuthService();
    $user=$auth->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Invalid token or user not found.',
            'data' => []
        ]);
    }

    $this->loginModel->update($user['user_id'], ['jwt_token' => null]);

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Logout successful. Token removed.',
        'data' => []
    ]);
}

public function sendOtp()
{
    $data = $this->request->getJSON(true);
    if (empty($data['email'])) {
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Email is required.',
            'data' => []
        ]);
    }
    $user = $this->loginModel->where('email', $data['email'])->first();

    if (!$user) {
        return $this->response->setJSON([
            'success' => true,
            'message' => 'User not found.',
            'data' => []
        ]);
    }
    $otp = rand(100000, 999999);
    $otpString = (string) $otp;
    $this->loginModel->update($user['user_id'], ['password' => $otpString]);

    return $this->response->setJSON([
        'success' => true,
        'message' => 'OTP sent successfully.',
        'data' => $otpString  
    ]);
}

//  public function sendOtp()
// {
//     $data = $this->request->getJSON(true);
    
//     if (empty($data['email'])) {
//         return $this->response->setJSON([
//             'success' => true,,
//             'message' => 'Email is required.'
//         ]);
//     }

//     $user = $this->loginModel->where('email', $data['email'])->first();

//     if (!$user) {
//         return $this->response->setJSON([
//             'success' => true,,
//             'message' => 'User not found.'
//         ]);
//     }

//     $otp = rand(100000, 999999);
//     $otpString = (string) $otp;
//     // Check if current value is different before updating
//     $update = ['password' => $otpString];

// // Only update if new OTP is different (or just always update)
//     if ($user['password'] !== $otpString) {
//     $this->loginModel->set($update)->where('user_id', $user['user_id'])->update();
// }

//         // return $this->response->setJSON([
//     //     'status' => true,
//     //     'message' => 'User found.',
//     //     'data' => $otpString
//     // ]);
//     // Send OTP via email
//     $emailService = \Config\Services::email();
//     // $emailService->setTo($data['email']);
//     $emailService->setTo('mufeedahidaya@gmail.com');
//     $emailService->setSubject('Password Reset OTP');
//     $emailService->setMessage("<p>Your OTP for resetting your password is: <b>$otp</b></p>");

//     if ($emailService->send()) {
//         return $this->response->setJSON([
//             'status' => true,
//             'message' => 'OTP sent to your email.'
//         ]);
//     } else {
//         echo $emailService->printDebugger(['headers']);
//         // return $this->response->setJSON([
//         //     'success' => true,,
//         //     'message' => 'Failed to send OTP email.'
//         // ]);
//     }
//     // $email = \Config\Services::email();
//     // // $email->setSMTPConnectOptions([
//     // //     'ssl' => [
//     // //         'verify_peer'       => false,
//     // //         'verify_peer_name'  => false,
//     // //         'allow_self_signed' => true,
//     // //     ]
//     // // ]);
//     // $email->setFrom('mufeedahidaya@gmail.com', 'mufeedahidaya');
//     // $email->setTo('csabhi007@gmail.com');
//     // $email->setSubject('Test Email');
//     // $email->setMessage('<strong>This is a test email using Gmail SMTP</strong>');

//     // if (!$email->send()) {
//     //     echo $email->printDebugger(['headers', 'subject', 'body']);
//     // } else {
//     //     echo 'Email sent successfully!';
//     // }
// }

public function resetPassword()
{
    $data = $this->request->getJSON(true);

    if (empty($data['email']) || empty($data['otp']) || empty($data['new_password'])) {
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Email, OTP, and new password are required.',
            'data' => []
        ]);
    }

    $user = $this->loginModel->where('email', $data['email'])->first();

    if (!$user || $user['password'] !== $data['otp']) {
        return $this->response->setJSON([
            'success' => true,
            'message' => 'Invalid OTP or email.',
            'data' => []
        ]);
    }

    $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);

    // Only update if new password is different from current password (which is OTP right now)
    if ($user['password'] !== $hashedPassword) {
        $this->loginModel->update($user['user_id'], ['password' => $hashedPassword]);
    }

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Password reset successful.',
        
    ]);
}
}