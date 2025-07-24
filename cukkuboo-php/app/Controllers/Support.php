<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Helpers\AuthHelper;
use App\Models\SupportModel;
use App\Libraries\AuthService;
use App\Models\UserModel;

class Support extends ResourceController
{
    protected $supportModel;
    protected $authService;

    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->db = \Config\Database::connect();
        $this->supportModel = new SupportModel();
        $this->authService = new AuthService();
        $this->UserModel = new UserModel();
    }
    public function submitIssue() 
    {
    $data= $this->request->getJSON(true);
    $authHeader = AuthHelper::getAuthorizationToken($this->request);
    $user = $this->authService->getAuthenticatedUser($authHeader);
    $isAuthenticated = $user && isset($user['user_id']);

    $supportId   = $data['support_id'] ?? null;
    $issue_type  = $data['issue_type'] ?? null;
    $description = $data['description'] ?? null;
    $status      = $data['status'] ?? null;
    $screenshot  = $data['screenshot'] ?? null;
    $name        = $data['name'] ?? null;
    $email       = $data['email'] ?? null;
    $phone       = $data['phone'] ?? null;

    $user_id = null;
    if ($isAuthenticated) {
        $user_id = $user['user_id'];
    }
    if ($supportId && $status !== null && !$name && !$email && !$phone && !$issue_type && !$description) {
        $existing = $this->supportModel->find($supportId);
        if (!$existing) {
            return $this->respond([
                'success' => false,
                'message' => 'Support issue not found'
            ]);
        }

        $updateData = [
            'status' => $status,
            'modify_on' => date('Y-m-d H:i:s')
        ];

        if ($isAuthenticated) {
            $updateData['modify_by'] = $user_id;
        }

        $this->supportModel->update($supportId, $updateData);
        $updated = $this->supportModel->find($supportId);
        if (!$isAuthenticated && isset($updated['user_id'])) {
            unset($updated['user_id']);
        }

        return $this->respond([
            'success' => true,
            'message' => 'Support issue status updated successfully',
            'data'    => $updated
        ]);
    }
    if (!$name || !$email || !$phone || !$issue_type || !$description) {
        return $this->respond([
            'success' => false,
            'message' => 'All fields are required',
        ]);
    }

    $data = [
        'name'        => $name,
        'email'       => $email,
        'phone'       => $phone,
        'issue_type'  => $issue_type,
        'description' => $description,
        'status'      => ($status === null || $status === '') ? 1 : $status,
        'screenshot'  => $screenshot,
    ];

    if ($isAuthenticated) {
        $data['user_id'] = $user_id;
    }

    if ($supportId) {
        $existing = $this->supportModel->find($supportId);
        if (!$existing) {
            return $this->respond([
                'success' => false,
                'message' => 'Support issue not found'
            ]);
        }

        $data['modify_on'] = date('Y-m-d H:i:s');
        if ($isAuthenticated) {
            $data['modify_by'] = $user_id;
        }

        $this->supportModel->update($supportId, $data);
        $updated = $this->supportModel->find($supportId);
        if (!$isAuthenticated && isset($updated['user_id'])) {
            unset($updated['user_id']);
        }

        return $this->respond([
            'success' => true,
            'message' => 'Support issue updated successfully',
            'data'    => $updated
        ]);
    } else {
        $data['created_on'] = date('Y-m-d H:i:s');
        if ($isAuthenticated) {
            $data['created_by'] = $user_id;
        }

        $newId   = $this->supportModel->insert($data);
        $newData = $this->supportModel->find($newId);
        if (!$isAuthenticated && isset($newData['user_id'])) {
            unset($newData['user_id']);
        }

        return $this->respond([
            'success' => true,
            'message' => 'Support issue created successfully',
            'data'    => $newData
        ]);
    }
}
    public function getAllList()
{
    // $authHeader = $this->request->getHeaderLine('Authorization');
    $authHeader = AuthHelper::getAuthorizationToken($this->request);
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->respond(['success' => false, 'message' => 'Unauthorized user.']);
    }

    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = trim($this->request->getGet('search') ?? '');

    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    $builder = $this->supportModel->getAllComplaints($search);

    $totalBuilder = clone $builder;
    $totalCount = $totalBuilder->countAllResults(false); 

    $history = $builder
        ->orderBy('support_issues.created_on', 'DESC') 
        ->limit($pageSize, $offset)
        ->get()
        ->getResult();

    return $this->respond([
        'success' => true,
        'message' => 'Completed history fetched successfully.',
        'total'   => $totalCount,
        'data'    => $history
    ]);
}
public function getUserComplaintsById($supportId = null)
{
    $authHeader = AuthHelper::getAuthorizationToken($this->request);
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    if ($supportId !== null) {
        $complaint = $this->supportModel->getComplaintById($supportId);

        if (!$complaint) {
            return $this->failNotFound('Complaint not found.');
        }

        return $this->respond([
            'success' => true,
            'message' => 'Complaint details fetched successfully.',
            'data' => $complaint
        ]);
    } else {
        $userId = $user['user_id'];
        $complaints = $this->supportModel->getComplaintsByUser($userId);

        return $this->respond([
            'success' => true,
            'message' => 'User complaints fetched successfully.',
            'total' => count($complaints),
            'data' => $complaints
        ]);
    }
}

public function delete($supportId= null)
    {
    // $authHeader = $this->request->getHeaderLine('Authorization');
    $authHeader = AuthHelper::getAuthorizationToken($this->request);
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $status = 9;

    $deleted = $this->supportModel->deletePlanById($status, (int)$supportId, $user['user_id']);

    if ($deleted) {
        return $this->respond([
            'success' => true,
            'message' => "Complaint $supportId marked as deleted successfully.",
            'data'=>[]
        ]);
    }

    return $this->failServerError("Failed to delete complaint with ID $supportId.");
    }
    

}
