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
        'jwt_token',
        'fcm_token',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
        'date_of_birth',
        'email_preference'
    ];


    public function isUserExists($phone = null, $email = null)
{
    return $this->where('phone', $phone)
                ->orWhere('email', $email)
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

    public function deleteUserById($status, $user_id)
    {
        return $this->where('user_id', $user_id)->set(['status' => $status])->update();
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
        return $this->db->query("SELECT * FROM user WHERE status != 9 and user_type = 'customer'" )->getResult();
    }

    //--------------------------------------Admin Home Display----------------------------//
    public function countActiveUsers()
    {
        return $this->where('status', 1)->countAllResults();
    }
    public function deleteById($status, $userId)
    {
        return $this->update($userId, ['status' => $status]);
    }

    // -----------------------------------Password changing-----------------------//
    public function changePassword($userId, $oldPassword, $newPassword)
{
    $user = $this->find($userId);

    if (!$user) {
        return ['status' => 0, 'msg' => 'User not found.'];
    }

    
    if (!password_verify($oldPassword, $user['password'])) {
        return ['status' => 0, 'msg' => 'Old password does not match.'];
    }

   
    if (password_verify($newPassword, $user['password'])) {
        return ['status' => 0, 'msg' => 'Please use a new password different from the old one.'];
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    $data = [
        'password'    => $hashedPassword,
        'updated_at'  => date('Y-m-d H:i:s')
    ];

    if ($this->update($userId, $data)) {
        return ['status' => 1, 'msg' => 'Password updated successfully.'];
    } else {
        return ['status' => 0, 'msg' => 'Could not update the password. Please try again.'];
    }
}
    public function setUserSubscription($userId)
{
    return $this->where('user_id', $userId)
                ->set([
                    'subscription' => 'cancel',
                    'updated_at'  => date('Y-m-d H:i:s')
                ])
                ->update();
}

    public function markExpiredUserSubscriptions($userId)
{
    $today = date('Y-m-d');
    return $this->where('user_id', $userId)
                ->where('end_date <', $today)
                ->where('subscription !=', 'expired')
                ->set([
                    'subscription' => 'expired',
                    'updated_at'  => date('Y-m-d H:i:s')
                ])
                ->update();
}


}
