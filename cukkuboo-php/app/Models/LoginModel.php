<?php

namespace App\Models;

use CodeIgniter\Model;

class LoginModel extends Model
{
    protected $table = 'user';
    protected $primaryKey = 'user_id';

    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $allowedFields = [
        'username',
        'phone',
        'email',
        'password',
        'status',
        'subscription',
        'last_login',
        'jwt_token',
        'fcm_token' 
    ];

    public function findUserByEmail($email)
    {
        return $this->where('email', $email)->first();
    }

    public function updateLoginData($userId, $data)
    {
        return $this->update($userId, $data);
    }
}
