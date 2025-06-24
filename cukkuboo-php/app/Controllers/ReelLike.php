<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\ReelLikeModel;
use App\Libraries\Jwt;

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
        $authHeader = $this->request->getHeaderLine('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $this->failUnauthorized('Invalid or missing Authorization header');
        }

        $token = $matches[1];
        $decodedData = $this->jwt->decode($token);

        if (!$decodedData) {
            return $this->failUnauthorized('Invalid or expired token');
        }

        $data = $this->request->getJSON(true);
        $userId = $data['user_id'] ?? null;
        $reelId = $data['reels_id'] ?? null;
        $status = $data['status'] ?? null;

        if (!$userId || !$reelId || !in_array($status, [1, 2])) {
            return $this->failValidationError('Invalid or missing data');
        }

        if ($userId != $decodedData->user_id) {
            return $this->failUnauthorized('User ID mismatch');
        }

        $existing = $this->reelLikeModel->getUserReelLike($userId, $reelId);

        if (!$existing) {
            $this->reelLikeModel->insertUserLike([
                'user_id'   => $userId,
                'reels_id'  => $reelId,
                'status'    => $status,
                'created_on'=> date('Y-m-d H:i:s'),
                'created_by'=> $userId
            ]);
        } else {
            if ($existing['status'] == $status) {
                $this->reelLikeModel->removeUserLike($userId, $reelId);
            } else {
                $this->reelLikeModel->updateUserLike($userId, $reelId, $status);
            }
        }

        $this->reelLikeModel->updateReelLikeCount($reelId);

        return $this->respond(['success' => true, 'message' => 'Action processed']);
    }
}
