<?php

namespace App\Models;

use CodeIgniter\Model;

class LoginModel extends Model
{
    protected $table = 'user';
    protected $primaryKey = 'user_id';

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    protected $allowedFields = [
        'username',
        'email',
        'password',
        'jwt_token',
        'last_login'
    ];

    // Optional: Clear all jwt_tokens
    public function updateAllTokensNull()
    {
        return $this->builder()->update(['jwt_token' => null]);
    }
}
