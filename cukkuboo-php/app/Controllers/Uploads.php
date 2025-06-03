<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

use App\Models\VideoModel;


class Uploads extends ResourceController
{
   

    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
    }

    public function uploadVideo()
{
    $video = $this->request->getFile('video');

    if (!$video->isValid()) {
        return $this->response->setStatusCode(400)->setJSON(['error' => $video->getErrorString()]);
    }
      // Optional: Check file size (in bytes), e.g., max 2GB = 2 * 1024 * 1024 * 1024
    $maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if ($video->getSize() > $maxSize) {
        return $this->response->setStatusCode(400)->setJSON([
            'error' => 'Video file exceeds maximum allowed size (2GB).'
        ]);
    }

    if (!in_array($video->getMimeType(), ['video/*','video/mp4', 'video/avi', 'video/mov'])) {
        return $this->response->setStatusCode(400)->setJSON(['error' => 'Invalid video format']);
    }

    $newName = $video->getRandomName();

    
    $targetPath = ROOTPATH . 'uploads/videos';
    if (!is_dir($targetPath)) {
        mkdir($targetPath, 0777, true); 
    }

    if ($video->move($targetPath, $newName)) {
        return $this->response->setJSON([
            'status' => 200,
            'message' => 'Video uploaded successfully',
            'file_name' => $newName,
            'path' => base_url("uploads/videos/$newName")
        ]);
    } else {
        return $this->response->setStatusCode(500)->setJSON(['error' => 'Failed to move the uploaded video']);
    }
}

public function uploadImage()
{
    $image = $this->request->getFile('image');

    
    if (!$image->isValid()) {
        return $this->response->setStatusCode(400)->setJSON(['error' => $image->getErrorString()]);
    }

   
    if (!in_array($image->getMimeType(), ['image/jpeg', 'image/png', 'image/webp'])) {
        return $this->response->setStatusCode(400)->setJSON(['error' => 'Invalid image format']);
    }

     $imgName = $image->getRandomName();

    
    $targetPath = ROOTPATH . 'uploads/images';

    
    if (!is_dir($targetPath)) {
        mkdir($targetPath, 0777, true);
    }

    // Move the uploaded image to the target directory
    if ($image->move($targetPath, $imgName)) {
        return $this->response->setJSON([
            'status' => 200,
            'message' => 'Image uploaded successfully',
            'file_name' => $imgName,
            'path' => base_url("uploads/images/$imgName")
        ]);
    } else {
        return $this->response->setStatusCode(500)->setJSON(['error' => 'Failed to move the uploaded image']);
    }
}
   

   
}