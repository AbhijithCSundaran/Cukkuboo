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
        $authHeader = $this->request->getHeaderLine('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $this->failUnauthorized('Invalid or missing Authorization header');
        }

        $token = $matches[1];
        $decodedData = $this->jwt->decode($token);

        if (!$decodedData || !isset($decodedData->user_id)) {
            return $this->failUnauthorized('Invalid or expired token');
        }

        $data = $this->request->getJSON(true);
        $userId = $data['user_id'] ?? null;
        $reelId = $data['reels_id'] ?? null;
        $status = $data['status'] ?? null;

        if (!$userId || !$reelId || $status != 1) {
            return $this->failValidationError('Invalid or missing data');
        }

        if ($userId != $decodedData->user_id) {
            return $this->failUnauthorized('User ID mismatch');
        }

        $existing = $this->reelViewModel->getUserReelView($userId, $reelId);

        if (!$existing) {
            // First-time view
            $this->reelViewModel->insertUserView([
                'user_id'    => $userId,
                'reels_id'   => $reelId,
                'status'     => $status,
                'created_on' => date('Y-m-d H:i:s'),
                'created_by' => $userId
            ]);

            $this->reelViewModel->updateReelViewCount($reelId);
        } else {
            // Update timestamp if already viewed
            $this->reelViewModel->updateUserView($userId, $reelId);
        }

        return $this->respond([
            'success' => true,
            'message' => 'Reel viewed successfully'
        ]);
    }
}
