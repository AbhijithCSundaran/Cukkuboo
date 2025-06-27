<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\ResumeModel;
use App\Libraries\AuthService;

class Resume extends ResourceController
{
    protected $resumeModel;
    protected $authService;

    public function __construct()
    {
        $this->resumeModel = new ResumeModel();
        $this->authService = new AuthService();
    }

    public function saveProgress()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user || !isset($user['user_id'])) {
            return $this->respond([
                'success' => false,
                'message' => 'Unauthorized user.'
            ]);
        }

        $data = $this->request->getJSON(true);
        $movId = $data['mov_id'] ?? null;
        $duration = $data['duration'] ?? null;

        if (!$movId || $duration === null) {
            return $this->respond([
                'success' => false,
                'message' => 'Movie ID and duration are required.'
            ]);
        }

        $result = $this->resumeModel->saveOrUpdate($user['user_id'], $movId, $duration);

        return $this->respond([
            'success' => true,
            'message' => $result ? 'Movie progress saved successfully.' : 'Failed to save progress.'
        ]);
    }

    public function viewHistory()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user || !isset($user['user_id'])) {
            return $this->respond([
                'success' => false,
                'message' => 'Unauthorized user.'
            ]);
        }

        $history = $this->resumeModel->getHistoryByUserId($user['user_id']);

        return $this->respond([
            'success' => true,
            'message' => 'Viewed movie history fetched successfully.',
            'data' => $history
        ]);
    }
}
