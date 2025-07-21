<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Helpers\AuthHelper;
use App\Models\SupportModel;
use App\Libraries\AuthService;

class Support extends ResourceController
{
    protected $supportModel;
    protected $authService;

    public function __construct()
    {
        $this->supportModel = new SupportModel();
        $this->authService = new AuthService();
        $this->db = \Config\Database::connect();
    }

    public function submitIssue()
    {
        $authHeader = AuthHelper::getAuthorizationToken($this->request);
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        $userId      = $user['user_id'];
        $supportId   = $this->request->getPost('support_id');
        $email       = $this->request->getPost('email');
        $phone       = $this->request->getPost('phone');
        $issue_type  = $this->request->getPost('issue_type');
        $description = $this->request->getPost('description');
        $status      = $this->request->getPost('status') ?? 1; 

        if (empty($email)) {
            return $this->failValidationErrors('Email is required.');
        }
        if (empty($phone)) {
            return $this->failValidationErrors('Phone Number is required.');
        }
        if (empty($issue_type)){
            return $this->failValidationErrors('Issue type is required.');
        }
        if (empty($description)){
            return $this->failValidationErrors('Description is required.');
        }
        $userData = $this->db->table('user')
        ->select('email, phone')
        ->where('user_id', $userId)
        ->get()
        ->getRowArray();

        if (!$userData || $userData['email'] !== $email || $userData['phone'] !== $phone) {
            return $this->failValidationErrors('Email or phone does not match your account information.');
        }
        $screenshotName = null;
        $screenshot = $this->request->getFile('screenshot');
        if ($screenshot && $screenshot->isValid() && !$screenshot->hasMoved()) {
            $screenshotName = $screenshot->getRandomName();
            $screenshot->move(FCPATH . 'uploads/screenshots', $screenshotName);
        }

        $data = [
            'email'       => $email,
            'phone'       => $phone,
            'issue_type'  => $issue_type,
            'description' => $description,
            'screenshot'  => $screenshotName ?? '',
            'status'      => $status,
        ];

        if ($supportId) {
            $existing = $this->supportModel->find($supportId);
            if (!$existing || $existing['status'] == 9) {
                return $this->failNotFound('Support issue not found or already deleted.');
            }

            $data['modify_by'] = $userId;
            $data['modify_on'] = date('Y-m-d H:i:s');

            if ($this->supportModel->update($supportId, $data)) {
                return $this->respond([
                    'success' => true,
                    'message' => 'Support issue updated successfully.'
                ]);
            } else {
                return $this->failServerError('Failed to update support issue.');
            }
        } else {
            $data['user_id']    = $userId;
            $data['created_by'] = $userId;
            $data['created_on'] = date('Y-m-d H:i:s');

            if ($this->supportModel->insert($data)) {
                return $this->respondCreated([
                    'success' => true,
                    'message' => 'Support issue created successfully.'
                ]);
            } else {
                return $this->failServerError('Failed to create support issue.');
            }
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
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser || !isset($authUser['user_id'])) {
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
        $userId = $authUser['user_id'];
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
