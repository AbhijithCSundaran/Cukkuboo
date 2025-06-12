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

    
    if (!$id && (empty($data['plan_name']) || empty($data['price']) || empty($data['period']))) {
        return $this->failValidationErrors('Plan name, price, and period are required.');
    }

    $periodInput = trim($data['period']);

    
    if (array_key_exists($periodInput, $this->periodMap)) {
        $period = $this->periodMap[$periodInput];
    }
    
    elseif (in_array((int)$periodInput, $this->periodMap, true)) {
        $period = (int)$periodInput;
    } else {
        return $this->failValidationErrors('Invalid period option.');
    }

    $data['period']         = $period;
    $data['discount_price'] = $data['discount_price'] ?? null;
    $data['features']       = $data['features'] ?? null;
    $data['modify_on']      = date('Y-m-d H:i:s');

    if (!$id) {
        $data['status']      = 1;
        $data['created_on']  = date('Y-m-d H:i:s');
        $data['created_by']  = $data['created_by'] ?? null;

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
        $plan = $this->subscriptionPlanModel->getPlanById($id);
        if (!$plan) {
            return $this->response->setJSON(['status' => false, 'message' => 'Plan not found'])->setStatusCode(404);
        }
        return $this->response->setJSON(['status' => true, 'data' => $plan]);
    }

    
public function deletePlan($id)
{

    $authHeader = $this->request->getHeaderLine('Authorization');
    
    $user = $this->authService->getAuthenticatedUser($authHeader);
     if (!$user)
            return $this->failUnauthorized('Invalid or missing token.');

    $status = 9;

    if ($this->subscriptionPlanModel->deletePlanById($status, $id)) {
        return $this->respond([
            'status' => 200,
            'message' => "plan with ID $id marked as deleted successfully."
        ]);
    } else {
        return $this->failServerError("Failed to delete reel with ID $id.");
    }
}

}