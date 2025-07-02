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
        $search = $this->request->getGet('search');
        if (!$user || !isset($user['user_id'])) {
            return $this->respond(['status' => false, 'message' => 'Unauthorized user.']);
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

    public function getHistory()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->respond(['success' => false, 'message' => 'Unauthorized user.'], 401);
    }

    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = trim($this->request->getGet('search') ?? '');

    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    $builder = $this->model->getAllUsersCompletedHistory($search);

    $totalBuilder = clone $builder;
    $totalCount = $totalBuilder->countAllResults(false); 

    $history = $builder
        ->orderBy('save_history.created_by', 'DESC') 
        ->limit($pageSize, $offset)
        ->get()
        ->getResult();

    return $this->respond([
        'success' => true,
        'message' => 'Completed movie history fetched for all users.',
        'total'   => $totalCount,
        'data'    => $history
    ]);
}

public function getById($id)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->respond(['success' => false, 'message' => 'Unauthorized user.']);
    }

    $userId = $user['user_id'];
    $data = $this->model->getCompletedHistoryById($id);

    if (!$data) {
        return $this->respond(['success' => false, 'message' => 'History entry not found.']);
    }

    return $this->respond([
        'success' => true,
        'message' => 'History entry fetched successfully.',
        'data'    => $data
    ]);
}


public function deleteHistory($saveHistoryId)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->respond(['status' => false, 'message' => 'Unauthorized user.'], 401);
    }

    $deleted = $this->model->softDeleteHistoryById($saveHistoryId);

    if ($deleted) {
        return $this->respond([
            'success' => true,
            'message' => "History entry ID $saveHistoryId deleted successfully.",
            'data'    => []
        ]);
    }

    return $this->respond([
        'success' => false,
        'message' => "No active history found for ID $saveHistoryId to delete or already deleted.",
        'data'    => []
    ]);
}

public function getUserHistory()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $authUser['user_id'];

    $history = $this->model->getCompletedHistory($userId); 

    $total = count($history);

    return $this->response->setJSON([
        'success' => true,
        'message' => 'History entries fetched successfully.',
        'total'   => $total,
        'data'    => $history
    ]);
}

public function clearAllHistory()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $user['user_id'];

    $clearedCount = $this->model->softDeleteAllHistoryByUser($userId);

    if ($clearedCount > 0) {
        return $this->respond([
            'success' => true,
            'message' => 'All history entries have been cleared successfully.',
            'data'    => ['cleared' => $clearedCount]
        ]);
    } else {
        return $this->failNotFound('No history entries found to delete or already cleared.');
    }
}



}
