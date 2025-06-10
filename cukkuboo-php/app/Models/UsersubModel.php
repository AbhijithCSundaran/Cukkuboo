<?php

namespace App\Models;

use CodeIgniter\Model;

class UsersubModel extends Model
{
    protected $table = 'user_subscription';
    protected $primaryKey = 'user_subscription_id';
    protected $allowedFields = ['user_id', 'subscription_id', 'start_date', 'end_date', 'status'];
    protected $useTimestamps = false;
}
