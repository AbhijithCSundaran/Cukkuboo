<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\WatchLaterModel;
use App\Libraries\AuthService;

class WatchLater extends ResourceController
{
    protected $watchLaterModel;
    protected $authService;

    public function __construct()
    {
        $this->watchLaterModel = new WatchLaterModel();
        $this->authService = new AuthService();
    }

    public function add()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if (!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
        if (!$user || !isset($user['user_id'])) {
            return $this->respond([
                'success' => false,
                'message' => 'Unauthorized user.',
                'data'=>[]
            ]);
        }

        $data = $this->request->getJSON(true);
        $movId = $data['mov_id'] ?? null;

        if (!$movId) {
            return $this->respond([
                'success' => false,
                'message' => 'Movie ID is required.'
            ]);
        }

        $added = $this->watchLaterModel->addToWatchLater($user['user_id'], $movId);

        return $this->respond([
            'success' => $added ? true : false,
            'message' => $added ? 'Movie added to Watch Later.' : 'Movie already in Watch Later.',
            'data'=>$data
        ]);
    }

    public function getlist()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if (!$user) 
            return $this->failUnauthorized('Invalid or missing token.');

        if (!$user || !isset($user['user_id'])) {
            return $this->respond([
                'success' => false,
                'message' => 'Unauthorized user.',
                'data'=>[]
            ]);
        }

        $data = $this->watchLaterModel->getWatchLaterByUserId($user['user_id']);

        return $this->respond([
            'success' => true,
            'message' => 'Watch Later list fetched successfully.',
            'data' => $data
        ]);
    }

    
}
