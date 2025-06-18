<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\ReelLikeModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService; 

class ReelLike extends ResourceController
{
    protected $reelLikeModel;
    protected $jwt;

    public function __construct()
    {
        $this->reelLikeModel = new ReelLikeModel();
        $this->jwt = new Jwt();
    }

    public function reelLike()
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

        // Optional: verify if user_id in token matches with request payload user_id
        $data = $this->request->getJSON(true);
        $userId  = $data['user_id'];
        $reelsId = $data['reels_id'];
        $status  = $data['status']; // 1 = like, 2 = dislike

        if ($userId != $decodedData->user_id) {
            return $this->failUnauthorized('User ID mismatch');
        }

        if (!in_array($status, [1, 2])) {
            return $this->failValidationError('Invalid status value.');
        }

        $existing = $this->reelLikeModel->getUserReelLike($userId, $reelsId);

        if (!$existing) {
            $this->reelLikeModel->insertUserLike([
                'user_id' => $userId,
                'reels_id' => $reelsId,
                'status' => $status,
                'created_on' => date('Y-m-d H:i:s'),
                'created_by' => $userId
            ]);
        } else {
            if ($existing['status'] == $status) {
                $this->reelLikeModel->removeUserLike($userId, $reelsId);
            } else {
                $this->reelLikeModel->updateUserLike($userId, $reelsId, $status);

                
            }
        }

        $this->reelLikeModel->updateReelLikeCounts($reelsId);

        return $this->respond(['success' => true, 'message' => 'Action processed']);
    }
}
