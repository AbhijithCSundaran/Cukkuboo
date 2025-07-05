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

    if (!$id) {
        return $this->failValidationErrors('user_subscription_id is required.');
    }
    $builder = $this->usersubModel->builder();

    $builder->select('
        us.user_subscription_id,
        us.user_id,
        us.subscriptionplan_id,
        sp.plan_name,
        sp.period,
        sp.price,
        sp.discount_price,
        sp.features,
        us.start_date,
        us.end_date,
        us.status,
        us.created_on,
        us.modify_on
    ')
    ->from('user_subscription us')
    ->join('subscriptionplan sp', 'sp.subscriptionplan_id = us.subscriptionplan_id', 'left')
    ->where('us.user_subscription_id', $id)
    ->where('us.status !=', 9)
    ->where('us.user_id', $user['user_id']);

    $record = $builder->get()->getRowArray();

    if (!$record) {
        return $this->respond([
            'success' => false,
            'message' => 'User subscription not found.',
            'data' => [
                'requested_id' => $id,
                'available_ids' => $this->usersubModel
                    ->select('user_subscription_id')
                    ->where('user_id', $user['user_id'])
                    ->where('status !=', 9)
                    ->findAll()
            ]
        ]);
    }
    return $this->respond([
        'success' => true,
        'message' => 'User subscription details fetched successfully.',
        'data' => $record
    ]);
}


public function getUserSubscriptions()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    // Get all active subscription plans
    $plans = $this->subscriptionPlanModel
        ->select('*') // Include created_by field from subscriptionplan table
        ->where('status !=', 9)
        ->findAll();

    if (empty($plans)) {
        return $this->respond([
            'success' => false,
            'message' => 'No active subscription plans found.',
        ]);
    }

    foreach ($plans as $plan) {
        $targetUserId = $plan['created_by']; // ✅ This is the user_id to use

        // Check if subscription already exists for this user and plan
        $existing = $this->usersubModel->where([
            'user_id' => $targetUserId,
            'subscriptionplan_id' => $plan['subscriptionplan_id']
        ])->first();

        if ($existing) {
            continue;
        }

        // Compute start and end dates
        $startDate = new \DateTime($plan['created_on']);
        $endDate = (clone $startDate)->modify("+{$plan['period']} days");
        $status = (new \DateTime() > $endDate) ? 2 : 1;

        // Insert into user_subscription table
        $this->usersubModel->insert([
            'user_id'             => $targetUserId,                     // ✅ From plan.created_by
            'subscriptionplan_id' => $plan['subscriptionplan_id'],
            'plan_name'           => $plan['plan_name'],
            'start_date'          => $startDate->format('Y-m-d'),
            'end_date'            => $endDate->format('Y-m-d'),
            'status'              => $status,
            'created_on'          => date('Y-m-d H:i:s'),
            'created_by'          => $plan['created_by'],               // ✅ Same as user_id
            'modify_on'           => date('Y-m-d H:i:s'),
            'modify_by'           => $plan['created_by']                // ✅ Same as user_id
        ]);
    }

    // Show full user_subscription table (if needed)
    $allSubscriptions = $this->usersubModel->findAll();

    return $this->respond([
        'success' => true,
        'message' => 'User subscriptions synced and listed successfully.',
        'data'    => $allSubscriptions
    ]);
}



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