<?php

namespace App\Controllers;

use App\Models\StaffModel;
use App\Libraries\JWT;

class Staff extends BaseController
{
    protected $staffModel;
    protected $jwt;

    public function __construct()
    {
        $this->staffModel = new StaffModel();
        $this->jwt = new JWT();
    }

    // Register staff (no token generated here)
    public function register()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Email and password are required.'
            ])->setStatusCode(400);
        }

        if ($this->staffModel->getStaffByEmail($data['email'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Staff already exists with this email.'
            ])->setStatusCode(409);
        }

        $staffData = [
            'name'      => $data['name'] ?? null,
            'phone'     => $data['phone'] ?? null,
            'role'      => $data['role'] ?? null,
            'join_date' => $data['join_date'] ?? date('Y-m-d H:i:s'),
            'email'     => $data['email'],
            'password'  => password_hash($data['password'], PASSWORD_BCRYPT),
            'status'    => $data['status'] ?? 'active',
            'jwt_token' => null
        ];

        $this->staffModel->insert($staffData);
        $staffId = $this->staffModel->getInsertID();
        $staff = $this->staffModel->find($staffId);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Staff registered successfully.',
            'data' => [
                'staff_id' => $staffId,
                'name' => $staff['name'],
                'email' => $staff['email'],
                'role' => $staff['role'],
                'status' => $staff['status'],
                'join_date' => $staff['join_date']
            ]
        ])->setStatusCode(201);
    }

    // Staff login - generate JWT token
    public function login()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Email and password are required.'
            ])->setStatusCode(400);
        }

        $staff = $this->staffModel->getStaffByEmail($data['email']);

        if (!$staff || !password_verify($data['password'], $staff['password'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid email or password.'
            ])->setStatusCode(401);
        }

        // Generate token and update staff record
        $token = $this->jwt->encode(['staff_id' => $staff['staff_id']]);
        $this->staffModel->update($staff['staff_id'], ['jwt_token' => $token]);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Login successful.',
            'token' => $token
        ]);
    }

    // Staff logout - clear token
    public function logout()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Authorization token required.'
        ])->setStatusCode(401);
    }

    $token = trim(str_replace('Bearer', '', $authHeader));

    // Just clear the token from the DB without decoding
    $staff = $this->staffModel->where('jwt_token', $token)->first();

    if (!$staff) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'Invalid token or already logged out.'
        ])->setStatusCode(401);
    }

    // Clear token in DB
    $this->staffModel->update($staff['staff_id'], ['jwt_token' => null]);

    return $this->response->setJSON([
        'status' => true,
        'message' => 'Logout successful.'
    ]);
}
public function updateStaff($staffId)
{
    $data = $this->request->getJSON(true);
    if (!$this->staffModel->find($staffId)) {
        return $this->response->setJSON(['status' => false, 'message' => 'Staff not found'])->setStatusCode(404);
    }
    $this->staffModel->updateStaff($staffId, $data);
    return $this->response->setJSON(['status' => true, 'message' => 'Staff updated successfully']);
}

public function deleteStaff($staffId)
{
    if (!$this->staffModel->find($staffId)) {
        return $this->response->setJSON(['status' => false, 'message' => 'Staff not found'])->setStatusCode(404);
    }
    $this->staffModel->deleteStaff($staffId);
    return $this->response->setJSON(['status' => true, 'message' => 'Staff deleted successfully']);
}
}
