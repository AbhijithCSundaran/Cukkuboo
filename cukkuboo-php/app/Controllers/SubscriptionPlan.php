<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\SubscriptionPlanModel; 
use App\Models\UserModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;

class SubscriptionPlan extends ResourceController
{
    // protected $subscriptionPlanModel;

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
        $id   = $data['id'] ?? null;

        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        if (!isset($data['plan_name']) || !isset($data['price']) || !isset($data['period'])) {
            return $this->failValidationErrors('Plan name, price, and period are required.');
        }

        
                            if (!in_array($data['period'], $this->periodMap)) {
                        return $this->respond([
                            'status' => false,
                            'message' => 'Invalid period option'
                        ]);
                    }

                    $data['days'] = (int)$data['period']; // Already a valid day count


    $data['days'] = $this->periodMap[$data['period']];
    $data['features']  = $data['features'] ?? null;
    $data['modify_on'] = date('Y-m-d H:i:s');

    if (!$id) {
        $data['status'] = 1;
        $data['created_on'] = date('Y-m-d H:i:s');
        $data['created_by'] = $user['user_id'];

        $this->subscriptionPlanModel->addPlan($data);

        return $this->respond([
            'status' => true,
            'message' => 'Plan created successfully',
            'data'    => $data
        ]);
    }

    $existing = $this->subscriptionPlanModel->getPlanById($id);
    if (!$existing) {
        return $this->failNotFound("Plan with ID $id not found.");
    }

    $data['status'] = $data['status'] ?? $existing['status'];
    $this->subscriptionPlanModel->updatePlan($id, $data);

    return $this->respond([
        'status' => true,
        'message' => 'Plan updated successfully',
        'data'    => $data
    ]);
}

   public function getAll()
{
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search');
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    $builder = $this->subscriptionPlanModel
        ->where('status !=', 9);
    // Add search functionality
    if (!empty($search)) {
        $builder->groupStart()
            ->like('plan_name', $search)
            ->orLike('features', $search)
            ->groupEnd();
    }

    // Clone builder to get total count before applying pagination
    $total = $builder->countAllResults(false);
    // Apply pagination and ordering
    $plans = $builder
        ->orderBy('subscriptionplan_id', 'DESC')
        ->findAll($pageSize, $offset);

    return $this->response->setJSON([
        'status' => true,
        'data'   => $plans,
        'total'  => $total
    ]);
}
    public function get($id)
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
        $plan = $this->subscriptionPlanModel->getPlanById($id);
        if (!$plan) {
            return $this->response->setJSON(['status' => false, 'message' => 'Plan not found'])->setStatusCode(404);
        }
        return $this->response->setJSON(['status' => true, 'data' => $plan]);
    }

    public function delete($id = null)
    {
        // print_r('hi');
        // exit;
        // $auth = new AuthService();
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        $deleted = $this->subscriptionPlanModel
            ->deletePlanById(9, (int)$id, $user['user_id'] ?? null);

        if ($deleted) {
            return $this->respond([
                'status'  => true,
                'message' => "Plan with ID $id marked as deleted successfully."
            ]);
        }

        return $this->failServerError("Failed to delete plan with ID $id (no row updated).");
    }
}