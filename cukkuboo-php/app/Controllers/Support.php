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
    }

    public function submitIssue()
{
    // Get token and authenticated user
    $authHeader = AuthHelper::getAuthorizationToken($this->request);
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $user['user_id'];

    // Get form-data values
    $email = $this->request->getPost('email');
    $phone = $this->request->getPost('phone');
    $issue_type = $this->request->getPost('issue_type');
    $description = $this->request->getPost('description');

    // Validate required fields
    if (empty($email)) {
        return $this->failValidationErrors('Email is required.');
    }
    if (empty($issue_type)) {
        return $this->failValidationErrors('Issue type is required.');
    }
    if (empty($description)) {
        return $this->failValidationErrors('Description is required.');
    }

    // Handle file upload (optional)
    $screenshotName = null;
    $screenshot = $this->request->getFile('screenshot');

    if ($screenshot && $screenshot->isValid() && !$screenshot->hasMoved()) {
        $screenshotName = $screenshot->getRandomName();
        $screenshot->move(FCPATH . 'uploads/screenshots', $screenshotName);
    }

    
    $data = [
        'user_id'     => $userId,
        'email'       => $email,
        'phone'       => $phone,
        'issue_type'  => $issue_type,
        'description' => $description,
        'screenshot'  => $screenshotName ?? '', 
        'created_by'  => $userId,
        'created_on'  => date('Y-m-d H:i:s'),
    ];

    
    if ($this->supportModel->insert($data)) {
        return $this->respondCreated([
            'success' => true,
            'message' => 'Support issue submitted successfully.'
        ]);
    } else {
        return $this->failServerError('Failed to submit support issue.');
    }
}

}