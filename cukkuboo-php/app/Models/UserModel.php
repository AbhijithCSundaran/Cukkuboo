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

    // Check if user exists (by phone or email)
    public function isUserExists($phone = null, $email = null)
    {
        if (!$phone && !$email) {
            return false;
        }

        $builder = $this->builder();

        if ($phone && $email) {
            $builder->groupStart()
                    ->where('phone', $phone)
                    ->orWhere('email', $email)
                    ->groupEnd();
        } elseif ($phone) {
            $builder->where('phone', $phone);
        } elseif ($email) {
            $builder->where('email', $email);
        }

        return $builder->get()->getRowArray();
    }

    // Insert new user
    public function addUser($data)
    {
        $this->insert($data);
        return $this->getInsertID();
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

    // Get user by ID
    public function getUserById($userId)
    {
        return $this->where('user_id', $userId)->first();
    }

    // Update user by ID (alternative method)
    public function updateUserById($userId, $data)
    {
        return $this->where('user_id', $userId)->update($data);
    }

    // Delete user by ID (alternative method)
    public function deleteUserById($userId)
    {
        return $this->where('user_id', $userId)->delete();
    }

    // Get user by JWT token
    public function findUserByToken($token)
    {
        return $this->where('jwt_token', $token)->first();
    }
}
