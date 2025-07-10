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
    $today = date('Y-m-d');
    $activeSub = $this->usersubModel
    ->where('user_id', $userId)
    ->where('status', '2')  // '2' is your active status
    ->where('end_date >=', $today)
    ->first();

if ($activeSub) {
    return $this->respond([
        'success' => false,
        'message' => 'You already have an active subscription. You cannot subscribe to a new plan until it expires.',
        'data'    => []
    ]);
}

 
    if (!$planId) {
        return $this->failValidationErrors('subscriptionplan_id is required.');
    }
 
    $plan = $this->subscriptionPlanModel->getPlanById($planId);
    if (!$plan || (isset($plan['status']) && $plan['status'] == 9)) {
        return $this->failNotFound('This subscription plan has been deleted or is not available.');
    }
 
    $planName = $plan['plan_name'];
    $price = (float) ($plan['discount_price'] ?? 0);
    $startDate = date('Y-m-d');
 
    try {
        $start = new \DateTime($startDate);
        $end = clone $start;
        $end->add(new \DateInterval("P{$plan['period']}D"));
        $endDate = $end->format('Y-m-d');
    } catch (\Exception $e) {
        return $this->failValidationErrors('Invalid plan period.');
    }
 
    $status = 1;
    $planType = 'Premium';
    $payload = [
        'user_id'             => $userId,
        'subscriptionplan_id' => $planId,
        'plan_name'           => $planName,
        'price'               => $price,
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
    $payload['start_date'] = date('d F Y', strtotime($payload['start_date']));
    $payload['end_date']   = date('d F Y', strtotime($payload['end_date']));
 
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
        if (!$subscription || $subscription['status'] == 9) {
            return $this->respond([
                'success' => false,
                'message' => 'Subscription not found or unauthorized access.',
                'data'    => []
            ]);
        }
        $subscription['start_date'] = date('d F Y', strtotime($subscription['start_date']));
        $subscription['end_date'] = date('d F Y', strtotime($subscription['end_date']));

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
    $filteredSubscriptions = [];
    foreach ($subscriptions as $sub) {
        if ($sub['status'] != 9) {
            $sub['start_date'] = date('d F Y', strtotime($sub['start_date']));
            $sub['end_date'] = date('d F Y', strtotime($sub['end_date']));
            $filteredSubscriptions[] = $sub;
        }
    }

    if (empty($filteredSubscriptions)) {
        return $this->respond([
            'success' => false,
            'message' => 'No active subscriptions found.',
            'data'    => []
        ]);
    }

    return $this->respond([
        'success' => true,
        'message' => 'Subscriptions fetched successfully.',
        'data'    => $filteredSubscriptions
    ]);
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
    $fromDate  = $this->request->getGet('fromDate'); 
    $toDate    = $this->request->getGet('toDate');
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
                ->orLike('user_subscription.plan_name', $search)
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
    public function countSubscribers()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $authuser = $this->authService->getAuthenticatedUser($authHeader);
        if (!$authuser) 
            return $this->failUnauthorized('Invalid or missing token.');

        $userSubModel = new UsersubModel();
        $count = $this->usersubModel->countCurrentMonthSubscribers();
        return $this->respond([
            'success' => true,
            'message'=>'success',
            'data' => $count
        ]);
    }
    public function countRevenue()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $authUser = $this->authService->getAuthenticatedUser($authHeader);

        if (!$authUser) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        $totalPrice = $this->usersubModel->currentTotalRevenue();

        return $this->respond([
        'success' => true,
        'message' => 'Total subscription price for current month calculated successfully.',
        'data'    => ['total_price' => $totalPrice]
    ]);
    }
    public function listTransactions()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser || !isset($authUser['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }
    // $userId = $authUser['user_id'];
    $transactions = $this->usersubModel->getTransactions();

    if (empty($transactions)) {
        return $this->respond([
            'success' => false,
            'message' => 'No transactions found for the current month.',
            'data'    => []
        ]);
    }

    return $this->respond([
        'success' => true,
        'message' => 'Transactions fetched successfully.',
        'data'    => $transactions
    ]);
}

   public function getActiveSubscription()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $user['user_id'];
    $today = date('Y-m-d');

    $activeSubs = $this->usersubModel
        ->where('user_id', $userId)
        ->where('status', '2')  // Active
        ->where('end_date >=', $today)
        ->first();

    if (!$activeSubs) {
        return $this->respond([
            'success' => false,
            'message' => 'No active subscription found.',
            'data'    => []
        ]);
    }

    $endDate = new \DateTime($activeSubs['end_date']);
    $todayDate = new \DateTime($today);
    $daysRemaining = $todayDate->diff($endDate)->format('%a');

    $formatted = [
        'subscription_id' => $activeSubs['user_subscription_id'],
        'plan_name'       => $activeSubs['plan_name'],
        'price'           => $activeSubs['price'],
        'start_date'      => $activeSubs['start_date'],
        'end_date'        => $activeSubs['end_date'],
        'status'          => 'active',
        'purchased_on'    => $activeSubs['created_on'],
        'days_remaining'  => (int)$daysRemaining
    ];

    return $this->respond([
        'success' => true,
        'message' => 'Active subscription fetched successfully.',
        'data' => $formatted
    ]);
}


public function getExpiredSubscriptions()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $user['user_id'];

    // All subscriptions with status 9 (expired/deleted)
    $expiredSubs = $this->usersubModel
        ->where('user_id', $userId)
        ->where('status', '9')
        ->findAll();

    if (empty($expiredSubs)) {
        return $this->respond([
            'success' => false,
            'message' => 'No expired subscriptions found.',
            'data'    => []
        ]);
    }

    $formatted = array_map(function ($sub) {
        return [
            'subscription_id' => $sub['user_subscription_id'],
            'plan_name'       => $sub['plan_name'],
            'price'           => $sub['price'],
            'start_date'      => $sub['start_date'],
            'end_date'        => $sub['end_date'],
            'status'          => 'expired',
            'purchased_on'    => $sub['created_on']
        ];
    }, $expiredSubs);

    return $this->respond([
        'success' => true,
        'message' => 'Expired subscriptions fetched successfully.',
        'data'    => $formatted
    ]);
}


}