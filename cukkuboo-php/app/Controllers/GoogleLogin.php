<?php

namespace App\Controllers;

use App\Models\LoginModel;
use App\Libraries\Jwt;
use App\Helpers\AuthHelper; 
use App\Libraries\AuthService;
use App\Config\Email;
use App\Models\UsersubModel;
use App\Models\UserModel;
use App\Models\SubscriptionPlanModel;
use App\Models\NotificationModel;

class GoogleLogin extends BaseController
{
    protected $loginModel;

    public function __construct()
    {
        $this->loginModel = new LoginModel();
        $this->usersubModel = new UsersubModel();
        $this->subscriptionPlanModel = new SubscriptionPlanModel();
        $this->userModel = new UserModel();
        $this->notificationModel = new NotificationModel();
    }
    public function googleLogin()
{
    $data = $this->request->getJSON(true);

    if (!isset($data['email']) || !isset($data['google_token'])) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Email and Google token are required.',
            'data' => []
        ]);
    }

    $googleToken = $data['google_token'];
    $email = $data['email'];

    // Verify Google ID token
    $client = \Config\Services::curlrequest();
    $response = $client->get("https://oauth2.googleapis.com/tokeninfo?id_token=" . $googleToken);

    if ($response->getStatusCode() !== 200) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Invalid Google token.',
            'data' => []
        ]);
    }

    $googleUser = json_decode($response->getBody(), true);

    if ($googleUser['email'] !== $email) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Token and email do not match.',
            'data' => []
        ]);
    }

    $user = $this->loginModel->where('email', $email)->first();
    $now = date('Y-m-d H:i:s');
    $jwt = new Jwt();
    $isNew = false;

    if ($user) {
        if ($user['auth_type'] !== 'google') {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'This account is registered with manual login. Please use email and password.',
                'data' => []
            ]);
        }

        if ($user['status'] == 2) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Your account has been suspended by the admin.',
                'data' => []
            ]);
        } elseif ($user['status'] == 9) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Account deleted.',
                'data' => []
            ]);
        }
        $token = $jwt->encode(['user_id' => $user['user_id']]);
        $this->loginModel->update($user['user_id'], [
            'jwt_token' => $token,
            'last_login' => $now
        ]);
    } else {
        $userId = null;
        $now = date('Y-m-d H:i:s');
        $newUserData = [
            'email'          => $email,
            'username'       => isset($googleUser['name']) ? $googleUser['name'] : explode('@', $email)[0],
            'password'       => '', 
            'auth_type'      => 'google',
            'phone'          => '',
            'user_type'      => 'Customer',
            'status'         => 1,
            'subscription'   => 'free', 
            'isBlocked'      => 0,
            'join_date'      => $now,
            'date_of_birth'  => null,
            'country'        => '',
            'created_at'     => $now,
            'last_login'     => $now,
            'updated_at'    => $now
        ];

        $this->loginModel->insert($newUserData);
        $userId = $this->loginModel->insertID();

        $token = $jwt->encode(['user_id' => $userId]);

        $this->loginModel->update($userId, [
            'jwt_token'  => $token,
            'last_login' => $now,
            'created_by' => $userId,
            'updated_by' => $userId,
            'updated_at' => $now
        ]);

        $user = $this->loginModel->find($userId);
        $isNew = true;

    }
    $subscription = $this->usersubModel
        ->select('user_subscription.*, subscriptionplan.plan_name')
        ->join('subscriptionplan', 'subscriptionplan.subscriptionplan_id = user_subscription.subscriptionplan_id')
        ->where('user_id', $user['user_id'])
        ->where('user_subscription.status !=', 9)
        ->orderBy('user_subscription_id', 'DESC')
        ->first();

    $subscriptionData = $subscription ? [
        'user_subscription_id' => $subscription['user_subscription_id'],
        'subscriptionplan_id'  => $subscription['subscriptionplan_id'],
        'plan_name'            => $subscription['plan_name'],
        'start_date'           => $subscription['start_date'],
        'end_date'             => $subscription['end_date'],
        'subscription'         => $subscription['status']
    ] : [
        'subscriptionplan_id' => null,
        'plan_name' => null,
        'start_date' => null,
        'end_date' => null,
        'subscription' => 0
    ];

    $unreadCount = $this->notificationModel
        ->where('user_id', $user['user_id'])
        ->where('status', 1)
        ->countAllResults();

    return $this->response->setJSON([
        'success' => true,
        'message' => $isNew ? 'Registration successful via Google.' : 'Google login successful.',
        'data' => [
            'user_id'      => $user['user_id'],
            'username'     => $user['username'],
            'phone'        => $user['phone'] ?? '',
            'email'        => $user['email'],
            'auth_type'    => $user['auth_type'] ?? 'google',
            'isBlocked'    => $user['status'] == 2,
            'subscription' => $user['subscription'] ?? '',
            'status'       => $user['status'], 
            'user_type'    => $user['user_type'] ?? 'Customer',
            'created_by'   => $user['user_id'],
            // 'updated_by'   => $user['user_id'],
            'created_at'   => $user['created_at'],
            'updated_at'   => $user['updated_at'],
            'lastLogin'    => $now,
            'jwt_token'    => $token,
            'notifications' => $unreadCount,
            'subscription_details' => $subscriptionData
        ]
    ]);
}
}