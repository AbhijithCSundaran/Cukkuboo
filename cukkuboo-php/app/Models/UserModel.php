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

   public function deleteUserById($status, $userId)
		{
			
return $this->db->query("update user set status = '".$status."', updated_at=NOW() where user_id = '".$userId."'");
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
    // -----------------------------------Password changing-----------------------//
    public function changePassword(int $userId, string $oldPassword, string $newPassword): array
    {
      $email = $this->request->getPost('email');
    $newPassword = $this->request->getPost('newPassword');
    $confirmPassword = $this->request->getPost('confirmPassword');

    if (empty($email) || empty($newPassword) || empty($confirmPassword)) {
        return $this->response->setJSON(['status' => 0, 'msg' => 'All fields are required.']);
    }

    if ($newPassword !== $confirmPassword) {
        return $this->response->setJSON(['status' => 0, 'msg' => 'Passwords do not match.']);
    }

    $user = $this->UserModel->where('email', $email)->first();

    if (!$user) {
        return $this->response->setJSON(['status' => 0, 'msg' => 'User not found.']);
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    $this->UserModel->update($user['user_id'], [
        'password' => $hashedPassword,
        'updated_at' => date('Y-m-d H:i:s')
    ]);

    return $this->response->setJSON(['status' => 1, 'msg' => 'Password reset successfully.']);
}
    
}
