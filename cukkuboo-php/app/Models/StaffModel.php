<?php

namespace App\Models;

use CodeIgniter\Model;

class StaffModel extends Model
{
    protected $table = 'staff';
    protected $primaryKey = 'staff_id';
    protected $allowedFields = [
        'name',
        'phone',
        'role',
        'join_date',
        'password',
        'email',
        'status',
        'jwt_token'
    ];

    // Create new staff (register)
    public function addStaff($data)
    {
        $this->insert($data);
        return $this->getInsertID(); // return inserted staff_id
    }

    // Get staff details by ID
    public function findStaffById($staffId)
    {
        return $this->where('staff_id', $staffId)->first();
    }

    // Get staff details by Email (for login)
    public function getStaffByEmail($email)
    {
        return $this->where('email', $email)->first();
    }

    // Update staff details by ID
    public function updateStaff($staffId, $data)
    {
        return $this->where('staff_id', $staffId)->set($data)->update();
    }

    // Delete staff by ID
    public function deleteStaff($staffId)
    {
        return $this->where('staff_id', $staffId)->delete();
    }

    // Clear JWT token on logout
    public function clearToken($staffId)
    {
        return $this->update($staffId, ['jwt_token' => null]);
    }
}
