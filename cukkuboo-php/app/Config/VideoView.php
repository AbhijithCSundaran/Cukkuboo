<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\VideoviewModel;
use App\Libraries\Jwt;

class VideoView extends ResourceController
{
    protected $videoviewModel;
    protected $jwt;

    public function __construct()
    {
        $this->videoviewModel = new VideoviewModel();
        $this->jwt = new Jwt();
    }

    public function viewVideo()
    {
        $headers = $this->request->getHeaders();

        if (!isset($headers['Authorization'])) {
            return $this->failUnauthorized('Authorization header missing');
        }

        $authHeader = $headers['Authorization']->getValue();
        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $this->failUnauthorized('Invalid authorization header format');
        }

        $token = $matches[1];
        $decodedData = $this->jwt->decode($token);

        if (!$decodedData) {
            return $this->failUnauthorized('Invalid or expired token');
        }

        $data = $this->request->getJSON(true);
        $userId  = $data['user_id'];
        $movieId = $data['mov_id'];
        $status  = $data['status']; // status = 1 means viewed

        if ($userId != $decodedData->user_id) {
            return $this->failUnauthorized('User ID mismatch');
        }

        if ($status != 1) {
            return $this->failValidationError('Invalid status value for view');
        }

        $existing = $this->videoviewModel->getUserVideoView($userId, $movieId);
if (!$existing) {
    // First time view → insert and count
    $this->videoviewModel->insertUserView([
        'user_id' => $userId,
        'mov_id' => $movieId,
        'status' => $status,
        'created_on' => date('Y-m-d H:i:s'),
        'created_by' => $userId
    ]);

    $this->videoviewModel->updateVideoViewCount($movieId);
} else {
    // Already viewed → update modified_by/on, but no count increment
    $this->videoviewModel->updateUserView($userId, $movieId);
}

        return $this->respond(['success' => true, 
                                'message' => 'Movie viewed'
        ]);
    }
}
