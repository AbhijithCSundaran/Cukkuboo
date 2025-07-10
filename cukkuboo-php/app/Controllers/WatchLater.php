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

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $pageIndex = (int) ($this->request->getGet('pageIndex') ?? 0);
    $pageSize = $this->request->getGet('pageSize');
    $search = trim($this->request->getGet('search') ?? '');

    $isFullList = ($pageSize === null || $pageSize == -1);

    $watchLaterModel = new watchLaterModel();

    if ($isFullList) {
        $result = $watchLaterModel->getAllList($search);
    } else {
        $pageSize = (int) $pageSize;
        if ($pageSize <= 0) {
            $pageSize = 10;
        }

        $result = $watchLaterModel->getPaginatedList($pageIndex, $pageSize, $search);
    }

    return $this->respond([
        'success' => true,
        'message' => 'Watch Later list fetched successfully.',
        'total'   => $result['total'],
        'data'    => $result['data']
    ]);
}


 public function getById($id)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $entry = $this->watchLaterModel->getById($id); 

    if (!$entry) {
        return $this->respond([
            'success' => false,
            'message' => "No watch later entry found for ID $id.",
            'data' => []
        ]);
    }

    return $this->respond([
        'success' => true,
        'message' => "Watch later entry fetched successfully.",
        'data' => $entry
    ]);
}

public function getUserWatchLater($userId = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    if ($userId === null) {
        $userId = $authUser['user_id'];
    }

    if (!$userId) {
        return $this->failValidationErrors('User ID is required.');
    }

    $watchLaterList = $this->watchLaterModel->getWatchLaterByToken($userId);
    $total = count($watchLaterList);

    return $this->respond([
        'success' => true,
        'message' => 'Watch Later list fetched successfully.',
        'total' => $total,
        'data' => $watchLaterList
    ]);
}
public function delete($id = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    
    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    if ($id === null) {
        return $this->failValidationErrors('Watch Later ID is required.');
    }

    $watchLaterModel = new \App\Models\WatchLaterModel();

    if ($watchLaterModel->softDeleteById($id)) {
        return $this->respond([
            'success' => true,
            'message' => "Watch Later item with ID $id soft-deleted successfully.",
            'data' => []
        ]);
    } else {
        return $this->failServerError("Failed to delete Watch Later item with ID $id.");
    }
}
public function clearAllHistory()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $user['user_id'];

    $clearedCount = $this->watchLaterModel->hardDeleteAllHistoryByUser($userId);

    if ($clearedCount > 0) {
        return $this->respond([
            'success' => true,
            'message' => 'All history entries have been permanently deleted.',
            'data'    => ['cleared' => $clearedCount]
        ]);
    } else {
        return $this->failNotFound('No history entries found to delete.');
    }
}
    
}
