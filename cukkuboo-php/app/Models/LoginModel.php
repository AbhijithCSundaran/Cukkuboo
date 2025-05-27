<?php

namespace App\Models;

use CodeIgniter\Model;

class LoginModel extends Model
{
    protected $table = 'user';             // Table name
    protected $primaryKey = 'id';          // Primary key

    // Automatically manage created_at and updated_at
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $allowedFields = [
        'username',
        'phone',
        'email',
        'password',
        'token',
        'status',
        'subscription',
        'created_at',
        'updated_at',
        'last_login'
    ];

    // Optional: Add helper method
    public function getUserByEmail($email)
    {
        return $this->where('email', $email)->first();
    }
}
