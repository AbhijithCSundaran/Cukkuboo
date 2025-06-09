<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\ReelsModel;

class Reels extends ResourceController
{
    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->reelsModel = new ReelsModel();
    }

    public function addReel()
{
    $data = $this->request->getJSON(true);

    $reels_id = $data['reels_id'] ?? null;

    $reelData = [
        'title' => $data['title'] ?? null,
        'description' => $data['description'] ?? null,
        'release_date' => $data['release_date'] ?? null,
        'access' => $data['access'] ?? null,
        'status' => $data['status'] ?? null,
        'thumbnail' => $data['thumbnail'] ?? null,
        'views' => $data['views'] ?? 0,
        'likes' => $data['likes'] ?? 0,
        'modify_on' => date('Y-m-d H:i:s')
    ];

    if (empty($reels_id)) {
        // New insert
        $reelData['created_by'] = $data['created_by'] ?? null;
        $reelData['created_on'] = date('Y-m-d H:i:s');

        if ($this->reelsModel->insert($reelData)) {
            return $this->respond([
                'status' => 200,
                'message' => 'Reel added successfully',
                'data' => $reelData
            ]);
        } else {
            return $this->failServerError('Failed to add reel');
        }
    } else {
        // Update existing
        if ($this->reelsModel->update($reels_id, $reelData)) {
            return $this->respond([
                'status' => 200,
                'message' => 'Reel updated successfully',
                'data' => $reelData
            ]);
        } else {
            return $this->failServerError('Failed to update reel');
        }
    }
}


   

    public function getAllReels()
    {
        $pageIndex = (int) $this->request->getGet('pageIndex');
        $pageSize = (int) $this->request->getGet('pageSize');

        if ($pageIndex < 0) {
            $reels = $this->reelsModel
                ->where('status !=', 9)
                ->orderBy('reels_id', 'DESC')
                ->findAll();

            return $this->response->setJSON([
                'status' => true,
                'message' => 'All reels fetched (no pagination).',
                'data' => $reels,
                'total' => count($reels)
            ]);
        }

        if ($pageSize <= 0) {
            $pageSize = 10;
        }

        $offset = $pageIndex * $pageSize;

        $total = $this->reelsModel
            ->where('status !=', 9)
            ->countAllResults(false);

        $reels = $this->reelsModel
            ->where('status !=', 9)
            ->orderBy('reels_id', 'DESC')
            ->findAll($pageSize, $offset);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Paginated reels fetched successfully.',
            'data' => $reels,
            'total' => $total
        ]);
    }
   
public function getReelById($id)
{
    $data = $this->reelsModel->getReelById($id);

    return $this->response->setJSON([
        'status' => true,
        'message' => 'Reel details fetched successfully.',
        'data' => $data
    ]);
}

public function deleteReel($reels_id)
{
    // Check if the reel exists before attempting to delete
    $reel = $this->reelsModel->find($reels_id);

    if (!$reel) {
        return $this->failNotFound("Reel with ID $reels_id not found.");
    }

    // Proceed with deletion
    if ($this->reelsModel->deleteReel($reels_id)) {
        return $this->respond([
            'status' => 200,
            'message' => "Reel with ID $reels_id deleted successfully."
        ]);
    } else {
        return $this->failServerError("Failed to delete reel with ID $reels_id.");
    }
}

}