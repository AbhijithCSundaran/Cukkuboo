<?php

namespace App\Models;

use CodeIgniter\Model;

class LoginModel extends Model
{
    protected $table = 'user';         // Your users table name
    protected $primaryKey = 'id';      // Primary key column

    protected $allowedFields = [       // Fields allowed for insert/update if needed
        'username',
        'phone',
        'email',
        'password',
        'token',
        'status',
        'subscription',
        'join_date'
    ];

    // Optional: You can add helper methods if needed
    public function getUser($email, $token)
    {
        return $this->where('email', $email)
                    ->where('token', $token)
                    ->first();
    }
}
