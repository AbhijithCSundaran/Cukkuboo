<?php

namespace App\Controllers;

use App\Models\UsersubModel;
use App\Models\SubscriptionPlanModel;
use CodeIgniter\RESTful\ResourceController;
use App\Libraries\Jwt;
use App\Libraries\AuthService;
class Usersub extends ResourceController
{
    protected $usersubModel;
    protected $subscriptionPlanModel;

    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->authService = new AuthService();
        $this->usersubModel = new UsersubModel();
        $this->subscriptionPlanModel = new SubscriptionPlanModel();
    }

 public function autoSubscribe()
{
    $data = $this->request->getJSON(true);
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Unauthorized user.');
    }

    $userId         = $user['user_id'];
    $planId         = $data['subscriptionplan_id'] ?? null;

    if (!$planId) {
        return $this->failValidationErrors('Subscription plan ID is required.');
    }

    
    $plan = $this->subscriptionPlanModel->getPlanById($planId);
    if (!$plan) {
        return $this->failNotFound('Invalid subscription plan.');
    }

    $planName   = $plan['plan_name'];
    $startDate  = $plan['created_on'];

    
    try {
        $start = new \DateTime($startDate);
        $end   = clone $start;
        $end   = $end->add(new \DateInterval("P{$plan['period']}D"));
        $endDate = $end->format('Y-m-d');
    } catch (\Exception $e) {
        return $this->failValidationErrors('Invalid plan period or created_on format.');
    }

 
    $today = new \DateTime();
    $status = ($end >= $today) ? 1 : 2;

    $payload = [
        'user_id'             => $userId,
        'subscriptionplan_id' => $planId,
        'plan_name'           => $planName,
        'start_date'          => $startDate,
        'end_date'            => $endDate,
        'status'              => $status,
        'created_on'          => date('Y-m-d H:i:s'),
        'created_by'          => $userId,
        'modify_on'           => date('Y-m-d H:i:s'),
        'modify_by'           => $userId
    ];

   
    $existing = $this->usersubModel
        ->where('user_id', $userId)
        ->where('subscriptionplan_id', $planId)
        ->first();

    if ($existing) {
       
        $this->usersubModel->update($existing['user_subscription_id'], $payload);
        $payload['user_subscription_id'] = $existing['user_subscription_id'];
        $msg = 'Subscription updated successfully.';
    } else {
       
        $id = $this->usersubModel->insert($payload);
        $payload['user_subscription_id'] = $id;
        $msg = 'Subscription added successfully.';
    }

    return $this->respond([
        'success' => true,
        'message' => $msg,
        'data'    => $payload
    ]);
}

   public function getSubscriptionById($id = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    
    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    // Fetch the plan
    $plan = $this->subscriptionPlanModel->find($id);

    if (!$plan) {
        return $this->respond([
            'success' => false,
            'message' => 'Subscription plan not found.',
            'data' => [
                'id' => $id,
                'available_ids' => $this->subscriptionPlanModel->select('subscriptionplan_id')->findAll()
            ]
        ]);
    }

    // Calculate start and end date
    $startDate = $plan['created_on'];
    $endDate = (new \DateTime($startDate))
        ->add(new \DateInterval("P{$plan['period']}D"))
        ->format('Y-m-d');

    // Determine status based on end date
    $now = new \DateTime();
    $end = new \DateTime($endDate);
    $status = ($now > $end) ? 2 : 1;

    // Check if already exists to avoid duplication
    $existing = $this->usersubModel->where([
        'user_id' => $user['user_id'],
        'subscriptionplan_id' => $plan['subscriptionplan_id']
    ])->first();

    if (!$existing) {
        // Insert into user_subscription table
        $this->usersubModel->insert([
            'user_id' => $user['user_id'],
            'subscriptionplan_id' => $plan['subscriptionplan_id'],
            'plan_name' => $plan['plan_name'],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $status,
            'created_on' => date('Y-m-d H:i:s'),
            'created_by' => $user['user_id'],
            'modify_on' => date('Y-m-d H:i:s'),
            'modify_by' => $user['user_id']
        ]);
    }

    return $this->respond([
        'success' => true,
        'message' => 'Subscription plan fetched and user_subscription created (if not existing).',
        'data' => $plan
    ]);
}

//   public function getSubscriptionById($id = null)
//     {
//     $authHeader = $this->request->getHeaderLine('Authorization');
//     $user = $this->authService->getAuthenticatedUser($authHeader);
//     if(!$user){ 
//         return $this->failUnauthorized('Invalid or missing token.');
//     }
//     $record = $this->usersubModel->find($id);

//     if (!$record) {
//         return $this->respond([
//             'success' => false,
//             'message' => 'Subscription not found.',
//             'data' => [
//                 'id' => $id,
//                 'available_ids' => $this->usersubModel->select('user_subscription_id')->findAll()
//             ]
//         ]);
//     }

//     return $this->respond([
//         'success' => true,
//         'message'=>'success',
//         'data' => $record
//     ]);
// }


public function deleteSubscription($id = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $record = $this->usersubModel->find($id);
    if (!$record) {
        return $this->failNotFound("Subscription with ID $id not found.");
    }

    $status = 9;
    $deleted = $this->usersubModel->DeleteSubscriptionById($status, $id, $user['user_id']);

    if ($deleted) {
        return $this->respond([
            'success'  => true,
            'message' => "Subscription with ID $id marked as deleted successfully.",
            'data'=>[]
        ]);
    } 
else {
        return $this->failServerError("Failed to delete subscription with ID $id.");
    }
}

}