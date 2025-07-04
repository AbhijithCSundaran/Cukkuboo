<?php

namespace App\Models;

use CodeIgniter\Model;

class UsersubModel extends Model
{
    protected $table = 'user_subscription';
    protected $primaryKey = 'user_subscription_id';

    protected $allowedFields = [
        'user_id',
        'subscriptionplan_id',
        'plan_name',
        'start_date',
        'end_date',
        'status',
        'created_by',
        'created_on',
        'modify_by',
        'modify_on'
    ];
    protected $useTimestamps = false;
    protected $returnType = 'array';


    public function saveUserSubscription(array $payload, $id = null)
{
    if ($id) {
        $this->update($id, $payload);
        return $id;
    } else {
        return $this->insert($payload);
    }
}

    
    public function getAllSubscriptions()
    {
        return $this->orderBy($this->primaryKey, 'DESC')->findAll();
    }

    
    public function getSubscriptionById($id)
    {
        return $this->find($id);
    }

   
    public function DeleteSubscriptionById($status, $id, $modifiedBy = null)
{
    return $this->update($id, [
        'status'     => $status,
        'modify_on'  => date('Y-m-d H:i:s'),
        'modify_by'  => $modifiedBy
    ]);
}



   
}
