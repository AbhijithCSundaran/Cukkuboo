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
        $this->UserModel = new UserModel();	
        $this->authService = new AuthService();
        $this->usersubModel = new UsersubModel();
        $this->subscriptionPlanModel = new SubscriptionPlanModel();
    }

    
    public function saveSubscription()
{
    $data = $this->request->getJSON(true);
    $userSubscriptionId = $data['user_subscription_id'] ?? null;

   
    if (empty($data['user_id']) || empty($data['subscription_id']) || empty($data['start_date'])) {
        return $this->respond([
            'status'  => false,
            'message' => 'User ID, subscription ID, and start date are required.'
        ], 400);
    }

   
    $plan = $this->subscriptionPlanModel->getPlanById($data['subscription_id']);
    if (!$plan) {
        return $this->respond([
            'status'  => false,
            'message' => 'Invalid subscription plan.'
        ], 404);
    }

    
    $startDate = date_create($data['start_date']);
    $endDate   = date_add(clone $startDate, date_interval_create_from_date_string("{$plan['period']} days"));
    $currentDate = new \DateTime();
    $status = $endDate < $currentDate ? 'expired' : 'active';

    
    $subscriptionData = [
        'user_id'         => $data['user_id'],
        'subscription_id' => $data['subscription_id'],
        'start_date'      => $data['start_date'],
        'end_date'        => $endDate->format('Y-m-d'),
        'status'          => $status,
        'modify_on'       => date('Y-m-d H:i:s'),
    ];

    if (empty($userSubscriptionId)) {
        
        $subscriptionData['created_by'] = $data['created_by'] ?? null;
        $subscriptionData['created_on'] = date('Y-m-d H:i:s');

        $id = $this->usersubModel->insert($subscriptionData);
        $subscriptionData['user_subscription_id'] = $id;

        return $this->respond([
            'status'  => true,
            'message' => 'Subscription created successfully.',
            'data'    => $subscriptionData
        ]);
    } else {
       
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
    $record = $this->usersubModel->find($id);

    if (!$record) {
        return $this->respond([
            'status' => false,
            'message' => 'Subscription not found.'
        ], 404);
    }

    $this->usersubModel->delete($id); // Hard delete
    return $this->respond([
        'status' => true,
        'message' => 'Subscription deleted successfully.'
    ]);
}

}