<?php

namespace App\Controllers;

use App\Models\SubscriptionPlanModel; 


class SubscriptionPlan extends BaseController
{
    protected $subscriptionPlanModel;

    protected $periodMap = [
        'Monthly' => 1,
        'Quarterly' => 2,
        'Yearly' => 3
    ];

    public function __construct()
    {
        $this->subscriptionPlanModel = new SubscriptionPlanModel(); 
    }
public function savePlan()
{
    $data = $this->request->getJSON(true);

    $id = $data['id'] ?? null;  // get id if passed, null otherwise

    // Validate required fields for create
    if (empty($id)) {
        if (empty($data['plan_name']) || empty($data['price']) || empty($data['period'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Plan name, price, and period are required for creating a plan'
            ])->setStatusCode(400);
        }
    }

    // For both create and update, validate period if provided
    if (isset($data['period'])) {
        if (!isset($this->periodMap[$data['period']])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid period option'
            ])->setStatusCode(400);
        }
        $data['period_id'] = $this->periodMap[$data['period']];
        unset($data['period']);
    }

    if (empty($id)) {
        // Create new plan
        $this->subscriptionPlanModel->addPlan($data);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Plan created successfully'
        ]);
    } else {
        // Update existing plan

        $plan = $this->subscriptionPlanModel->getPlanById($id);
        if (!$plan) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Plan not found'
            ])->setStatusCode(404);
        }

        $this->subscriptionPlanModel->updatePlan($id, $data);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Plan updated successfully'
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

    public function delete($id)
    {
        $plan = $this->subscriptionPlanModel->getPlanById($id);
        if (!$plan) {
            return $this->response->setJSON(['status' => false, 'message' => 'Plan not found'])->setStatusCode(404);
        }

        $this->subscriptionPlanModel->deletePlan($id);

        return $this->response->setJSON(['status' => true, 'message' => 'Plan deleted successfully']);
    }
}
