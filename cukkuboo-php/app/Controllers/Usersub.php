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
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
       
        if (!$id && (empty($data['user_id']) || empty($data['subscriptionplan_id']) || empty($data['start_date']))) {
            return $this->failValidationErrors('User ID, plan ID, and start date are required.');
        }

       
        $plan = $this->subscriptionPlanModel->getPlanById($data['subscriptionplan_id']);
        if (!$plan) {
            return $this->failNotFound('Invalid subscription plan.');
        }

        
        $start = new \DateTime($data['start_date']);
        $end = $start->add(new \DateInterval("P{$plan['period']}D"))->format('Y-m-d');

       
        $payload = [
            'user_id'         => $data['user_id'] ?? null,
            'subscriptionplan_id' => $data['subscriptionplan_id'] ?? null,
            'start_date'      => $data['start_date'],
            'end_date'        => $end,
            'modify_on'       => date('Y-m-d H:i:s'),
            'modify_by'       => $data['modified_by'] ?? $data['created_by'] ?? 0,
        ];

        if (!$id) {
           
            $payload['status']      = 1;
            $payload['created_on']  = date('Y-m-d H:i:s');
            $payload['created_by']  = $data['created_by'] ?? 0;

            $id = $this->usersubModel->insert($payload);
            $payload['user_subscription_id'] = $id;

            return $this->respond([
                'success'  => true,
                'message' => 'Subscription created successfully.',
                'data'    => $payload
            ]);
        }

        
        $existing = $this->usersubModel->find($id);
        if (!$existing) {
            return $this->failNotFound("Subscription with ID $id not found.");
        }

        $payload['status'] = $data['status'] ?? $existing['status'];
        $this->usersubModel->update($id, $payload);
        $payload['user_subscription_id'] = $id;

        return $this->respond([
            'success'  => true,
            'message' => 'Subscription updated successfully.',
            'data'    => $payload
        ]);
    }


   public function getUserSubscriptions()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $builder = $this->usersubModel->builder();

    $builder->select('
        us.user_subscription_id,
        us.user_id,
        
        us.subscriptionplan_id,
        sp.plan_name,
        
        us.start_date,
        us.end_date,
        us.status
    ')
    ->from('user_subscription us')
    ->join('user u', 'u.user_id = us.user_id', 'left')
    ->join('subscriptionplan sp', 'sp.subscriptionplan_id = us.subscriptionplan_id', 'left')
    ->where('us.status !=', 9)
    ->where('us.user_id', $user['user_id'])
    ->orderBy('us.user_subscription_id', 'DESC');

    $results = $builder->get()->getResultArray();

    
    foreach ($results as &$row) {
        if (empty($row['end_date']) && !empty($row['start_date']) && !empty($row['period'])) {
            $startDate = new \DateTime($row['start_date']);
            $startDate->modify("+{$row['period']} days");
            $row['end_date'] = $startDate->format('Y-m-d');
            $this->usersubModel->update($row['user_subscription_id'], [
                'end_date' => $row['end_date']
            ]);
        }

        if (!empty($row['end_date']) && new \DateTime() > new \DateTime($row['end_date']) && $row['status'] != 2) {
            $this->usersubModel->update($row['user_subscription_id'], [
                'status' => 2
            ]);
            $row['status'] = 2;
        }
    }

    return $this->respond([
        'success' => true,
        'message' => 'User subscriptions fetched successfully.',
        'data' => $results
    ]);
}

  public function getSubscriptionById($id = null)
    {
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if(!$user){ 
        return $this->failUnauthorized('Invalid or missing token.');
    }
    $record = $this->usersubModel->find($id);

    if (!$record) {
        return $this->respond([
            'success' => false,
            'message' => 'Subscription not found.',
            'data' => [
                'id' => $id,
                'available_ids' => $this->usersubModel->select('user_subscription_id')->findAll()
            ]
        ]);
    }

    return $this->respond([
        'success' => true,
        'message'=>'success',
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