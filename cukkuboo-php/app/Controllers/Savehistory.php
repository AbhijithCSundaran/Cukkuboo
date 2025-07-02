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

    public function saveHistory()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->respond(['success' => false, 'message' => 'Unauthorized user.'], 401);
    }

    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    if ($pageSize <= 0) {
        $pageSize = 10;
    }
    $offset = $pageIndex * $pageSize;

   
    $builder = $this->model->getAllUsersCompletedHistory();

    
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
        return $this->respond(['success' => false, 'message' => 'Unauthorized user.'], 401);
    }

    $userId = $user['user_id'];

    $data = $this->model->getCompletedHistoryById($userId, $id);

    if (!$data) {
        return $this->respond(['success' => false, 'message' => 'History entry not found.'], 404);
    }

    return $this->respond([
        'success' => true,
        'message' => 'History entry fetched successfully.',
        'data'    => $data
    ]);
}
public function deleteHistory($mov_id)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->respond(['status' => false, 'message' => 'Unauthorized user.'], 401);
    }

    $userId = $user['user_id'];

    // Call model method to soft delete
    $deleted = $this->model->softDeleteHistory($userId, $mov_id);

    if ($deleted) {
        return $this->respond([
            'success' => true,
            'message' => "History entry for movie ID $mov_id deleted successfully.",
            'data'    => []
        ]);
    }

    return $this->respond([
        'success' => false,
        'message' => "No active history found for movie ID $mov_id to delete or already deleted.",
        'data'    => []
    ], 404);
}

public function getUserHistory()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $userId = $authUser['user_id'];

    $history = $this->model->getCompletedHistory($userId); // Must return list of history items for the user

    $total = count($history);

    return $this->response->setJSON([
        'success' => true,
        'message' => 'History entries fetched successfully.',
        'total'   => $total,
        'data'    => $history
    ]);
}


}
