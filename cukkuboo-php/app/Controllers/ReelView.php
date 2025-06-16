<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\ReelViewModel;
use App\Libraries\Jwt;

class ReelView extends ResourceController
{
    protected $reelViewModel;
    protected $jwt;

    public function __construct()
    {
        $this->reelViewModel = new ReelViewModel();
        $this->jwt = new Jwt();
    }

    public function viewReel()
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
        $reelsId = $data['reels_id'];
        $status  = $data['status']; // status = 1 means viewed

        if ($userId != $decodedData->user_id) {
            return $this->failUnauthorized('User ID mismatch');
        }

        if ($status != 1) {
            return $this->failValidationError('Invalid status value for view');
        }

        $existing = $this->reelViewModel->getUserReelView($userId, $reelsId);
if (!$existing) {
    // First time view → insert and count
    $this->reelViewModel->insertUserView([
        'user_id' => $userId,
        'reels_id' => $reelsId,
        'status' => $status,
        'created_on' => date('Y-m-d H:i:s'),
        'created_by' => $userId
    ]);

    $this->reelViewModel->updateReelViewCount($reelsId);
} else {
    // Already viewed → update modified_by/on, but no count increment
    $this->reelViewModel->updateUserView($userId, $reelsId);
}

        return $this->respond(['success' => true, 'message' => 'Reel viewed']);
    }
}
