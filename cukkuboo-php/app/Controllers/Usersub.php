<?php

namespace App\Controllers;

use App\Models\UsersubModel;
use App\Models\SubscriptionPlanModel;
use CodeIgniter\RESTful\ResourceController;

class Usersub extends ResourceController
{
    protected $usersubModel;
    protected $subscriptionPlanModel;

    public function __construct()
    {
        $this->usersubModel = new UsersubModel();
        $this->subscriptionPlanModel = new SubscriptionPlanModel();
    }

    public function create()
    {
    $data = $this->request->getJSON(true);

    if (empty($data['user_id']) || empty($data['subscription_id']) || empty($data['start_date'])) {
        return $this->respond([
            'status' => false,
            'message' => 'User ID, subscription ID, and start date are required.'
        ], 400);
    }

    // Get plan duration (in days)
    $plan = $this->subscriptionPlanModel->getPlanById($data['subscription_id']);

    if (!$plan) {
        return $this->respond([
            'status' => false,
            'message' => 'Invalid subscription plan.'
        ], 404);
    }

    $startDate = date_create($data['start_date']);
    $endDate = date_add(clone $startDate, date_interval_create_from_date_string("{$plan['period']} days"));

    // Determine status based on current date
    $currentDate = new \DateTime();
    $status = $endDate < $currentDate ? 'expired' : 'active';

    $saveData = [
        'user_id'         => $data['user_id'],
        'subscription_id' => $data['subscription_id'],
        'start_date'      => $data['start_date'],
        'end_date'        => $endDate->format('Y-m-d'),
        'status'          => $status
    ];

    $this->usersubModel->insert($saveData);

    return $this->respond([
        'status' => true,
        'message' => 'Subscription added successfully.',
        'data' => $saveData
    ]);
}
}