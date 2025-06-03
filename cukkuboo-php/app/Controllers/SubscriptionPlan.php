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

    public function getAll()
    {
        $plans = $this->subscriptionPlanModel->getAllPlans();
        return $this->response->setJSON(['status' => true, 'data' => $plans]);
    }

    public function get($id)
    {
        $plan = $this->subscriptionPlanModel->getPlanById($id);
        if (!$plan) {
            return $this->response->setJSON(['status' => false, 'message' => 'Plan not found'])->setStatusCode(404);
        }
        return $this->response->setJSON(['status' => true, 'data' => $plan]);
    }

    public function create()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['plan_name']) || empty($data['price']) || empty($data['period'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Plan name, price, and period are required'
            ])->setStatusCode(400);
        }

        if (!isset($this->periodMap[$data['period']])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid period option'
            ])->setStatusCode(400);
        }

        $data['period_id'] = $this->periodMap[$data['period']];
        unset($data['period']);

        $this->subscriptionPlanModel->addPlan($data);

        return $this->response->setJSON(['status' => true, 'message' => 'Plan created successfully']);
    }

    public function edit($id)
    {
        $plan = $this->subscriptionPlanModel->getPlanById($id);
        if (!$plan) {
            return $this->response->setJSON(['status' => false, 'message' => 'Plan not found'])->setStatusCode(404);
        }

        $data = $this->request->getJSON(true);

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

        $this->subscriptionPlanModel->updatePlan($id, $data);

        return $this->response->setJSON(['status' => true, 'message' => 'Plan updated successfully']);
    }

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
