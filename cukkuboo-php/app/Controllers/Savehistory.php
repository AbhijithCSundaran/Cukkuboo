<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\SavehistoryModel;
use App\Libraries\AuthService;

class Savehistory extends ResourceController
{
    protected $model;
    protected $authService;

    public function __construct()
    {
        $this->model = new SavehistoryModel();
        $this->authService = new AuthService();
    }

    public function saveMovie()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user || !isset($user['user_id'])) {
            return $this->respond(['status' => false, 'message' => 'Unauthorized user.'], 401);
        }

        $data = $this->request->getJSON(true);
        $movId = $data['mov_id'] ?? null;

        if (!$movId) {
            return $this->respond(['status' => false, 'message' => 'Movie ID is required.'], 400);
        }

        $result = $this->model->saveCompleted($user['user_id'], $movId);

        return $this->respond([
            'success' => true,
            'message' => $result ? 'Completed movie saved.' : 'Failed to save movie.'
        ]);
    }

    public function saveHistory()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user || !isset($user['user_id'])) {
            return $this->respond(['status' => false, 'message' => 'Unauthorized user.'], 401);
        }

        $history = $this->model->getCompletedHistory($user['user_id']);

        return $this->respond([
            'success' => true,
            'message' => 'Completed movie history fetched.',
            'data' => $history
        ]);
    }
}
