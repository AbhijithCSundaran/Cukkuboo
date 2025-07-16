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

    if ($user) {
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
        // Create new user
        $newUserData = [

            'email'         => $email,
            'username'      => explode('@', $email)[0],
            'password'      => '', // no password for Google login
            'auth_type'     => 'google',
            'phone'         => '',          
            'user_type'     => 'user',      
            'status'        => 1,           
            'subscription'  => 0,           
            'isBlocked'     => 0,           
            'join_date'     => $now,        
            'date_of_birth' => null,        
            'country'       => '',          
            'created_at'    => $now,
            'updated_at'    => $now,
            'last_login'    => $now,
        ];
     
        $this->loginModel->insert($newUserData);
        $userId = $this->loginModel->insertID();

        $token = $jwt->encode(['user_id' => $userId]);

        $this->loginModel->update($userId, [
            'jwt_token' => $token,
            'last_login' => $now
        ]);

        $user = $this->loginModel->find($userId);
    }
    $usersubModel = new UsersubModel();
    $notificationModel = new NotificationModel();

    $subscription = $usersubModel
        ->select('user_subscription.*, subscriptionplan.plan_name') 
        ->join('subscriptionplan', 'subscriptionplan.subscriptionplan_id = user_subscription.subscriptionplan_id')
        ->where('user_id', $user['user_id'])
        ->where('user_subscription.status !=', 9)
        ->orderBy('user_subscription_id', 'DESC')
        ->first();

    $subscriptionData = $subscription ? [
        'user_subscription_id'=> $subscription['user_subscription_id'],
        'subscriptionplan_id' => $subscription['subscriptionplan_id'],
        'plan_name'           => $subscription['plan_name'],
        'start_date'          => $subscription['start_date'],
        'end_date'            => $subscription['end_date'],
        'subscription'        => $subscription['status']
    ] : [
        'subscriptionplan_id' => null,
        'plan_name' => null,
        'start_date' => null,
        'end_date' => null,
        'subscription' => 0
    ];

    $unreadCount = $notificationModel
        ->where('user_id', $user['user_id'])
        ->where('status', 1)
        ->countAllResults();

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Google login successful.',
        'data' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'phone' => $user['phone'] ?? '',
            'email' => $user['email'],
            'isBlocked' => $user['status'] !== 'active',
            'subscription' => $user['subscription'] ?? '',
            'user_type' => $user['user_type'] ?? 'user',
            'createdAt' => $user['created_at'],
            'updatedAt' => $user['updated_at'],
            'lastLogin' => $now,
            'jwt_token' => $token,
            'notifications' => $unreadCount,
            'subscription_details' => $subscriptionData
        ]
    ]);
}
}