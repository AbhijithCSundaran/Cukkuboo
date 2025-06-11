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

    
   public function saveSubscription()
{
    $data = $this->request->getJSON(true);
    $userSubscriptionId = $data['user_subscription_id'] ?? null;

    // Validation for required fields when creating
    if (empty($userSubscriptionId)) {
        if (empty($data['user_id']) || empty($data['subscription_id']) || empty($data['start_date'])) {
            return $this->failValidationErrors('User ID, subscription ID, and start date are required.');
        }
    }

    // Get the subscription plan
    $plan = $this->subscriptionPlanModel->getPlanById($data['subscription_id']);
    if (!$plan) {
        return $this->failNotFound('Invalid subscription plan.');
    }

    // Calculate end date
    $startDate = date_create($data['start_date']);
    $endDate = date_add(clone $startDate, date_interval_create_from_date_string("{$plan['period']} days"));

    // Base data
    $subscriptionData = [
        'user_id'         => $data['user_id'] ?? null,
        'subscription_id' => $data['subscription_id'] ?? null,
        'start_date'      => $data['start_date'],
        'end_date'        => $endDate->format('Y-m-d'),
        'modify_on'       => date('Y-m-d H:i:s'),
        'modify_by' => $data['modified_by'] ?? $data['created_by'] ?? 0,

    ];

    if (empty($userSubscriptionId)) {
        // For create
        $subscriptionData['status']      = 1;
        $subscriptionData['created_on'] = date('Y-m-d H:i:s');
       $subscriptionData['created_by'] = $data['created_by'] ?? 0;

        $insertedId = $this->usersubModel->insert($subscriptionData);
        $subscriptionData['user_subscription_id'] = $insertedId;

        return $this->respond([
            'status'  => true,
            'message' => 'Subscription created successfully.',
            'data'    => $subscriptionData
        ]);
    } else {
        // For update
        $existing = $this->usersubModel->find($userSubscriptionId);
        if (!$existing) {
            return $this->failNotFound("Subscription with ID $userSubscriptionId not found.");
        }

        $subscriptionData['status'] = $data['status'] ?? $existing['status'];

        $this->usersubModel->update($userSubscriptionId, $subscriptionData);
        $subscriptionData['user_subscription_id'] = $userSubscriptionId;

        return $this->respond([
            'status'  => true,
            'message' => 'Subscription updated successfully.',
            'data'    => $subscriptionData
        ]);
    }
}

  public function getAllSubscriptions()
    {
        $pageIndex = (int) $this->request->getGet('pageIndex');
        $pageSize  = (int) $this->request->getGet('pageSize');

        if ($pageIndex < 0) {
            $subscriptions = $this->usersubModel
                ->where('status !=', 'deleted')
                ->orderBy('user_subscription_id', 'DESC')
                ->findAll();

            return $this->respond([
                'status' => true,
                'data'   => $subscriptions,
                'total'  => count($subscriptions)
            ]);
        }

        if ($pageSize <= 0) {
            $pageSize = 10;
        }

        $offset = $pageIndex * $pageSize;

        $total = $this->usersubModel
            ->where('status !=', 'deleted')
            ->countAllResults(false); 

        $subscriptions = $this->usersubModel
            ->where('status !=', 'deleted')
            ->orderBy('user_subscription_id', 'DESC')
            ->findAll($pageSize, $offset);

        return $this->respond([
            'status' => true,
            'data'   => $subscriptions,
            'total'  => $total
        ]);
    }
 
    public function getSubscriptionById($id = null)
{
    $record = $this->usersubModel->find($id);

    if (!$record) {
        return $this->respond([
            'status' => false,
            'message' => 'Subscription not found.',
            'debug' => [
                'id' => $id,
                'available_ids' => $this->usersubModel->select('user_subscription_id')->findAll()
            ]
        ], 404);
    }

    return $this->respond([
        'status' => true,
        'data' => $record
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
        return $this->respond([
            'status' => false,
            'message' => 'Subscription not found.'
        ], 404);
    }

   
    $updated = $this->usersubModel->update($id, [
        'status'     => 9,
        'modify_on'  => date('Y-m-d H:i:s'),
        'modify_by'  => $user['user_id'] ?? 0 
    ]);

    if ($updated) {
        return $this->respond([
            'status'  => true,
            'message' => "Subscription with ID $id marked as deleted successfully."
        ]);
    } else {
        return $this->failServerError("Failed to delete subscription with ID $id.");
    }
}

}