<?php

namespace App\Models;

use CodeIgniter\Model;

class SubscriptionPlanModel extends Model
{
    protected $table = 'subscriptionplan';
    protected $primaryKey = 'subscriptionplan_id';
    
   
    protected $allowedFields = [
        'plan_name',
        'price',
        'discount_price',
        'period',
        'features'
    ];

    protected $useTimestamps = false;

    public function getAllPlans()
    {
        return $this->orderBy('subscriptionplan_id', 'DESC')->findAll();
    }

    public function getPlanById($id)
    {
        return $this->where('subscriptionplan_id', $id)->first();
    }

    public function addPlan($data)
    {
        return $this->insert($data);
    }

    public function updatePlan($id, $data)
    {
        return $this->update($id, $data);
    }

    public function deletePlanById($status, $id,)
{
    return $this->update($id, [
        'status'     => $status,
        'modify_on'  => date('Y-m-d H:i:s')
    ]);
}

}
