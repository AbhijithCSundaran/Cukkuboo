<?php

namespace App\Controllers;

use App\Models\SubscriptionPlanModel; 
use App\Models\UserModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;

class SubscriptionPlan extends BaseController
{
    protected $subscriptionPlanModel;

    protected $periodMap = [
        '3 days' => 3,
        '30 days' => 30,
        '90 days' => 90,
        '1 Year' => 365
    ];

    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->subscriptionPlanModel = new SubscriptionPlanModel(); 
        $this->UserModel = new UserModel();	
        $this->authService = new AuthService();
       
    }
    public function savePlan()
{
    $data = $this->request->getJSON(true);
    $id = $data['id'] ?? null;

    if (empty($id)) {
        if (empty($data['plan_name']) || empty($data['price']) || empty($data['period'])) {
            return $this->failValidationErrors('Plan name, price, and period are required.');
        }
    }

    if (!empty($data['period']) && !isset($this->periodMap[$data['period']])) {
        return $this->failValidationErrors('Invalid period option.');
    }

    $data['period']         = $this->periodMap[$data['period']] ?? null;
    $data['discount_price'] = $data['discount_price'] ?? null;
    $data['features']       = $data['features'] ?? null;

    // Set timestamps
    $data['modify_on'] = date('Y-m-d H:i:s');

    if (empty($id)) {
        // Set default status for new plans
        $data['status']     = 1; // Active
        $data['created_on'] = date('Y-m-d H:i:s');
        $data['created_by'] = $data['created_by'] ?? null;

        $this->subscriptionPlanModel->addPlan($data);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Plan created successfully',
            'data'    => $data
        ]);
    } else {
        $existing = $this->subscriptionPlanModel->getPlanById($id);
        if (!$existing) {
            return $this->failNotFound("Plan with ID $id not found.");
        }

        // Keep status from existing record if not passed
        $data['status'] = $data['status'] ?? $existing['status'];

        $this->subscriptionPlanModel->updatePlan($id, $data);
        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Plan updated successfully',
            'data'    => $data
        ]);
    }
}


    public function getAll()
{
    // Get pagination parameters from the query string
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');

    // If pageIndex is negative, return all plans without pagination
    if ($pageIndex < 0) {
        $plans = $this->subscriptionPlanModel
            ->orderBy('subscriptionplan_id', 'DESC')
            ->findAll();

        return $this->response->setJSON([
            'status' => true,
            'data'   => $plans,
            'total'  => count($plans)
        ]);
    }

    // Apply fallback/default values if invalid
    if ($pageSize <= 0) {
        $pageSize = 10; // Default page size
    }

    $offset = $pageIndex * $pageSize;

    // Get total number of records
    $total = $this->subscriptionPlanModel->countAll();

    // Get paginated plans
    $plans = $this->subscriptionPlanModel
        ->orderBy('subscriptionplan_id', 'DESC')
        ->findAll($pageSize, $offset);

    // Return response
    return $this->response->setJSON([
        'status' => true,
        'data'   => $plans,
        'total'  => $total
    ]);
}


    public function get($id)
    {
        $plan = $this->subscriptionPlanModel->getPlanById($id);
        if (!$plan) {
            return $this->response->setJSON(['status' => false, 'message' => 'Plan not found'])->setStatusCode(404);
        }
        return $this->response->setJSON(['status' => true, 'data' => $plan]);
    }

    // public function create()
    // {
    //     $data = $this->request->getJSON(true);

    //     if (empty($data['plan_name']) || empty($data['price']) || empty($data['period'])) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Plan name, price, and period are required'
    //         ])->setStatusCode(400);
    //     }

    //     if (!isset($this->periodMap[$data['period']])) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Invalid period option'
    //         ])->setStatusCode(400);
    //     }

    //     $data['period_id'] = $this->periodMap[$data['period']];
    //     unset($data['period']);

    //     $this->subscriptionPlanModel->addPlan($data);

    //     return $this->response->setJSON(['status' => true, 'message' => 'Plan created successfully']);
    // }

    // public function edit($id)
    // {
    //     $plan = $this->subscriptionPlanModel->getPlanById($id);
    //     if (!$plan) {
    //         return $this->response->setJSON(['status' => false, 'message' => 'Plan not found'])->setStatusCode(404);
    //     }

    //     $data = $this->request->getJSON(true);

    //     if (isset($data['period'])) {
    //         if (!isset($this->periodMap[$data['period']])) {
    //             return $this->response->setJSON([
    //                 'status' => false,
    //                 'message' => 'Invalid period option'
    //             ])->setStatusCode(400);
    //         }
    //         $data['period_id'] = $this->periodMap[$data['period']];
    //         unset($data['period']);
    //     }

    //     $this->subscriptionPlanModel->updatePlan($id, $data);

    //     return $this->response->setJSON(['status' => true, 'message' => 'Plan updated successfully']);
    // }

    public function deletePlan($id)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

   
    $plan = $this->subscriptionPlanModel->getPlanById($id);
    if (!$plan) {
        return $this->respond([
            'status' => 404,
            'message' => "Plan with ID $id not found."
        ]);
    }

    $status = 9; 
    if ($this->subscriptionPlanModel->deletePlanById($status, $id, $user['user_id'])) {
        return $this->respond([
            'status' => 200,
            'message' => "Plan with ID $id marked as deleted successfully."
        ]);
    } else {
        return $this->failServerError("Failed to delete plan with ID $id.");
    }
}

}