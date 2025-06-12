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
        $id = $data['user_subscription_id'] ?? null;

        // Validate required fields for create
        if (!$id && (empty($data['user_id']) || empty($data['subscription_id']) || empty($data['start_date']))) {
            return $this->failValidationErrors('User ID, plan ID, and start date are required.');
        }

        // Verify plan exists
        $plan = $this->subscriptionPlanModel->getPlanById($data['subscription_id']);
        if (!$plan) {
            return $this->failNotFound('Invalid subscription plan.');
        }

        // Calculate end date
        $start = new \DateTime($data['start_date']);
        $end = $start->add(new \DateInterval("P{$plan['period']}D"))->format('Y-m-d');

        // Build data payload
        $payload = [
            'user_id'         => $data['user_id'] ?? null,
            'subscription_id' => $data['subscription_id'] ?? null,
            'start_date'      => $data['start_date'],
            'end_date'        => $end,
            'modify_on'       => date('Y-m-d H:i:s'),
            'modify_by'       => $data['modified_by'] ?? $data['created_by'] ?? 0,
        ];

        if (!$id) {
            // Creating new subscription
            $payload['status']      = 1;
            $payload['created_on']  = date('Y-m-d H:i:s');
            $payload['created_by']  = $data['created_by'] ?? 0;

            $id = $this->usersubModel->insert($payload);
            $payload['user_subscription_id'] = $id;

            return $this->respond([
                'status'  => true,
                'message' => 'Subscription created successfully.',
                'data'    => $payload
            ]);
        }

        // Update existing subscription
        $existing = $this->usersubModel->find($id);
        if (!$existing) {
            return $this->failNotFound("Subscription with ID $id not found.");
        }

        $payload['status'] = $data['status'] ?? $existing['status'];
        $this->usersubModel->update($id, $payload);
        $payload['user_subscription_id'] = $id;

        return $this->respond([
            'status'  => true,
            'message' => 'Subscription updated successfully.',
            'data'    => $payload
        ]);
    }


    public function getAllSubscriptions()
    {
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = max(10, (int) $this->request->getGet('pageSize'));
    $search    = $this->request->getGet('search');

    $offset = $pageIndex * $pageSize;

    $builder = $this->usersubModel->builder(); // start fresh query builder
    $builder->select('us.*, u.username AS username')
        ->from('user_subscription us')
        ->join('user u', 'u.user_id = us.user_id', 'left')
        ->where('us.status !=', 9);

    if (!empty($search)) {
        $builder->like('u.username', $search);
    }

    if ($pageIndex < 0) {
        $rows = $builder->orderBy('us.user_subscription_id', 'DESC')
                        ->get()
                        ->getResultArray();

        return $this->respond([
            'status' => true,
            'data'   => $rows,
            'total'  => count($rows),
        ]);
    }

    $total = $builder->countAllResults(false);

    $rows = $builder->orderBy('us.user_subscription_id', 'DESC')
        ->limit($pageSize, $offset)
        ->get()
        ->getResultArray();

    return $this->respond([
        'status' => true,
        'data'   => $rows,
        'total'  => $total,
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
        return $this->failNotFound("Subscription with ID $id not found.");
    }

    $status = 9;
    $deleted = $this->usersubModel->DeleteSubscriptionById($status, $id, $user['user_id']);

    if ($deleted) {
        return $this->respond([
            'status'  => true,
            'message' => "Subscription with ID $id marked as deleted successfully."
        ]);
    } else {
        return $this->failServerError("Failed to delete subscription with ID $id.");
    }
}

}