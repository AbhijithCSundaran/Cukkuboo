<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
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
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        $userId = $user['user_id'];

        // Get raw JSON body
        $data = $this->request->getJSON(true);

        $email = $data['email'] ?? null;
        $phone = $data['phone'] ?? null;
        $issue_type = $data['issue_type'] ?? null;
        $description = $data['description'] ?? null;

        // Validation
        if (empty($email)) {
            return $this->failValidationErrors('Email is required.');
        }
        if (empty($issue_type)) {
            return $this->failValidationErrors('Issue type is required.');
        }
        if (empty($description)) {
            return $this->failValidationErrors('Description is required.');
        }

        // Insert data with user ID from token
        $data = [
            'user_id' => $userId,
            'email' => $email,
            'phone' => $phone,
            'issue_type' => $issue_type,
            'description' => $description,
            'created_on' => date('Y-m-d H:i:s')
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
