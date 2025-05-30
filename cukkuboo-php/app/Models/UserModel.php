<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'user';
    protected $primaryKey = 'user_id';
    protected $allowedFields = [
        'username',
        'phone',
        'email',
        'password',
        'country',
        'status',
        'join_date',
        'subscription',
        'user_type',
        'jwt_token'
    ];

    //Check if user exists (by phone or email)
    public function isUserExists($phone, $email)
    {
        return $this->where('phone', $phone)
                    ->orWhere('email', $email)
                    ->first();
    }

    // Insert new user
    public function addUser($data)
    {
        $this->insert($data);
        return $this->getInsertID(); // Return the newly inserted user_id
    }

    // Update user details by user_id
    public function updateUser($userId, $data)
    {
        return $this->db->table($this->table)
                        ->where('user_id', $userId)
                        ->update($data);
    }

    // Delete user by user_id
    public function deleteUser($userId)
    {
        return $this->db->table($this->table)
                        ->where('user_id', $userId)
                        ->delete();
    }

    //  Get user by ID
    public function findUserById($userId)
    {
        return $this->where('user_id', $userId)->first();
    }

    //  Get user by JWT token
    public function findUserByToken($token)
    {
        return $this->where('jwt_token', $token)->first();
    }
}
