<?php

namespace App\Models;

use CodeIgniter\Model;

class SupportModel extends Model
{
    protected $table = 'support_issues';
    protected $primaryKey = 'support_id';
    protected $allowedFields = ['user_id', 'email', 'phone', 'issue_type', 'description', 'screenshot', 'created_by','created_on','modify_by','modify_on'];
}
