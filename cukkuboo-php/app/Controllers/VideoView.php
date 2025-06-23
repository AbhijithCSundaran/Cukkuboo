<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\VideoviewModel;
use App\Models\UserModel;
use App\Libraries\AuthService;

class VideoView extends ResourceController
{
    protected $videoviewModel;
    protected $userModel;
    protected $authService;

    public function __construct()
    {
        $this->videoviewModel = new VideoviewModel();
        $this->userModel = new UserModel();	
        $this->authService = new AuthService();
    }

    public function viewVideo()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        $data = $this->request->getJSON(true);
        $userId  = $data['user_id'] ?? null;
        $movieId = $data['mov_id'] ?? null;
        $status  = $data['status'] ?? null;

        if (!$userId || !$movieId || !isset($status)) {
            return $this->failValidationError('Missing required fields.');
        }

        if ($userId != $user['user_id']) {
            return $this->failUnauthorized('User ID mismatch');
        }

        if ($status != 1) {
            return $this->failValidationError('Invalid status value for view');
        }

        $existing = $this->videoviewModel->getUserVideoView($userId, $movieId);

        if (!$existing) {
            $this->videoviewModel->insertUserView([
                'user_id'    => $userId,
                'mov_id'     => $movieId,
                'status'     => $status,
                'created_on' => date('Y-m-d H:i:s'),
                'created_by' => $userId
            ]);

            $this->videoviewModel->updateVideoViewCount($movieId);
        } else {
            $this->videoviewModel->updateUserView($userId, $movieId);
        }

        return $this->respond([
            'success' => true,
            'message' => 'Movie viewed'
        ]);
    }
}
