<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\ResumeModel;
use App\Libraries\AuthService;

class Resume extends ResourceController
{
    protected $resumeModel;
    protected $authService;

    public function __construct()
    {
        $this->resumeModel = new ResumeModel();
        $this->authService = new AuthService();
    }

    public function saveProgress()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user || !isset($user['user_id'])) {
            return $this->respond([
                'success' => false,
                'message' => 'Unauthorized user.'
            ]);
        }

        $data = $this->request->getJSON(true);
        $movId = $data['mov_id'] ?? null;
        $duration = $data['duration'] ?? null;

        if (!$movId || $duration === null) {
            return $this->respond([
                'success' => false,
                'message' => 'Movie ID and duration are required.'
            ]);
        }

        $result = $this->resumeModel->saveOrUpdate($user['user_id'], $movId, $duration);

        return $this->respond([
            'success' => true,
            'message' => $result ? 'Movie progress saved successfully.' : 'Failed to save progress.'
        ]);
    }

    public function getAllHistory()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user || !isset($user['user_id'])) {
            return $this->respond(['success' => false, 'message' => 'Unauthorized user.']);
    }

        $pageIndex = (int) $this->request->getGet('pageIndex');
        $pageSize  = (int) $this->request->getGet('pageSize');
        $search    = trim($this->request->getGet('search') ?? '');

        if ($pageSize <= 0) {
            $pageSize = 10;
        }

        $offset = $pageIndex * $pageSize;

         $builder = $this->resumeModel->getHistoryByUserId($user['user_id'], $search);

        $totalBuilder = clone $builder;
        $totalCount = $totalBuilder->countAllResults(false);

        
        $history = $builder
            ->orderBy('resume_history.created_by', 'DESC') 
            ->limit($pageSize, $offset)
            ->get()
            ->getResult();

        return $this->respond([
            'success' => true,
            'message' => 'Viewed movie history fetched successfully.',
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
    $data = $this->resumeModel->getHistoryById($id);

    if (!$data) {
        return $this->respond(['success' => false, 'message' => 'History entry not found.']);
    }

    return $this->respond([
        'success' => true,
        'message' => 'History entry fetched successfully.',
        'data'    => $data
    ]);
}
public function deleteHistoryById($id = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user || !isset($user['user_id'])) {
        return $this->respond([
            'success' => false,
            'message' => 'Unauthorized user.'
        ]);
    }

    if ($id === null) {
        return $this->failValidationErrors('History ID is required.');
    }
    $history = $this->resumeModel->where('id', $id)  
                                 ->where('user_id', $user['user_id'])
                                 ->where('status !=', 9)
                                 ->first();

    if (!$history) {
        return $this->failNotFound('History record not found or already deleted.');
    }
    $updated = $this->resumeModel->update($id, ['status' => 9]);

    if ($updated) {
        return $this->respond([
            'success' => true,
            'message' => 'History entry deleted successfully.'
        ]);
    } else {
        return $this->respond([
            'success' => false,
            'message' => 'Failed to delete history entry.'
        ]);
    }
}

}
