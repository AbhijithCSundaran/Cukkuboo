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
        'jwt_token'
    ];

    public function isUserExists($phone = null, $email = null)
    {
        return $this->groupStart()
                    ->where('phone', $phone)
                    ->orWhere('email', $email)
                    ->groupEnd()
                    ->first();
    }

    public function addUser($data)
    {
        $this->insert($data);
        return $this->getInsertID();
    }

    public function updateUser($userId, $data)
    {
        return $this->update($userId, $data);
    }

    public function deleteUser($userId)
    {
        return $this->delete($userId);
    }

    public function getUserById($userId)
    {
        return $this->find($userId);
    }

    public function findUserByToken($token)
    {
        return $this->where('jwt_token', $token)->first();
    }

    public function getAllUsers()
    {
        return $this->findAll();
    }
}
