<?php

namespace App\Controllers;

use App\Models\UsersubModel;
use App\Models\UserModel;
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
        $this->userModel = new UserModel();
    }

 public function autoSubscribe()
{
    $data = $this->request->getJSON(true);
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Unauthorized user.');
    }

    $userId = $user['user_id'];
    $planId = $data['subscriptionplan_id'] ?? null;

    if (!$planId) {
        return $this->failValidationErrors('subscriptionplan_id is required.');
    }

    $plan = $this->subscriptionPlanModel->getPlanById($planId);
    if (!$plan || (isset($plan['status']) && $plan['status'] == 9)) {
        return $this->failNotFound('This subscription plan has been deleted or is not available.');
    }

    $planName  = $plan['plan_name'];
    $startDate = date('Y-m-d');

    try {
        $start = new \DateTime($startDate);
        $end = clone $start;
        $end = $end->add(new \DateInterval("P{$plan['period']}D"));
        $endDate = $end->format('Y-m-d');
    } catch (\Exception $e) {
        return $this->failValidationErrors('Invalid plan period.');
    }

    
    $status = 2;
    $planType = 'Premium';

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
    $this->userModel->update($userId, ['subscription' => 'premium']);
   
    $payload['plan_type'] = $planType;

    return $this->respond([
        'success' => true,
        'message' => $msg,
        'data'    => $payload
    ]);
}


  public function getSubscriptionById($id = null)
{
    $authUser = $this->authService->getAuthenticatedUser(
        $this->request->getHeaderLine('Authorization')
    );

    if (!$authUser || !isset($authUser['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $authUser['user_id'];

    if ($id !== null) {
        $subscription = $this->usersubModel->getUserSubscriptionById($userId, $id);

        if (!$subscription) {
            return $this->respond([
                'success' => false,
                'message' => 'Subscription not found or unauthorized access.',
                'data'    => []
            ]);
        }

        $subscription['plan_type'] = $this->mapPlanType($subscription['status']);

        return $this->respond([
            'success' => true,
            'message' => 'Subscription fetched successfully.',
            'data'    => $subscription
        ]);
    }

    $subscriptions = $this->usersubModel->getUserSubscriptions($userId);

    if (empty($subscriptions)) {
        return $this->respond([
            'success' => false,
            'message' => 'No subscriptions found for the user.',
            'data'    => []
        ]);
    }

    foreach ($subscriptions as &$sub) {
        $sub['plan_type'] = $this->mapPlanType($sub['status']);
    }

    return $this->respond([
        'success' => true,
        'message' => 'Subscriptions fetched successfully.',
        'data'    => $subscriptions
    ]);
}

private function mapPlanType($status)
{
    return match ((int) $status) {
        1 => 'Free',
        2 => 'Premium',
        3 => 'Cancelled',
        default => 'Unknown'
    };
}


public function getUserSubscriptions()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authuser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authuser) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search');

    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    $userSubModel = new UsersubModel();
    $builder = $userSubModel->select('user_subscription.*, user.username')
                            ->join('user', 'user.user_id = user_subscription.user_id', 'left')
                            ->where('user_subscription.status !=', 9);

    if (!empty($search)) {
        $builder->groupStart()
                ->like('user.username', $search)
                ->orLike('user_subscription.user_id', $search)
                ->orLike('user_subscription.start_date', $search)
                ->groupEnd();
    }
    $total = $builder->countAllResults(false);

    $subscriptions = $builder->orderBy('user_subscription.user_subscription_id', 'DESC')
                             ->findAll($pageSize, $offset);
    foreach ($subscriptions as &$sub) {
    if ($sub['status'] == 1 && $sub['end_date'] < date('Y-m-d')) {
        $this->usersubModel->update($sub['user_subscription_id'], ['status' => 2]);
        $sub['status'] = 2;
    }

    $sub['plan_type'] = ($sub['status'] == 1) ? 'Free' : 'Premium';
}


    return $this->response->setJSON([
        'success' => true,
        'message' => 'Subscription list fetched successfully.',
        'data'    => $subscriptions,
        'total'   => $total
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
    else 
    {
        return $this->failServerError("Failed to delete subscription with ID $id.");
    }
}
public function cancelSubscription()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $user['user_id'];
    $this->usersubModel->cancelUserSubscription($userId);
    $this->userModel->setUserSubscription($userId);

    return $this->respond([
        'success' => true,
        'message' => 'Subscription cancelled successfully.',
        'data' => [
            'user_id' => $userId,
            'subscription' => 'cancel'
        ]
    ]);
}


}