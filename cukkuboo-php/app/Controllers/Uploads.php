<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;

class Uploads extends ResourceController
{
    protected $UserModel;
    protected $authService;

    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->UserModel = new UserModel();	
        $this->authService = new AuthService();

    }

    public function uploadVideo()
    {
        ini_set('max_execution_time', '0');
        ini_set('upload_max_filesize', '20000M');
        // $authHeader = $this->request->getHeaderLine('Authorization');
        $authHeader = apache_request_headers()["Authorization"];
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');

        $video = $this->request->getFile('video');
        if (!$video || !$video->isValid()) {
            return $this->failValidationErrors($video ? $video->getErrorString() : 'No video uploaded.');
        }

        $allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
        if (!in_array($video->getMimeType(), $allowedTypes)) {
            return $this->failValidationErrors('Invalid video format.');
        }

        // Move uploaded file
        $newName = $video->getRandomName();
        $uploadPath = ROOTPATH . 'uploads/videos/';
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }

        if ($video->move($uploadPath, $newName)) {
            return $this->respond([
                'success'    => true,
                'message'   => 'Video uploaded successfully',
                'file_name' => $newName,
                'path'      => base_url("uploads/videos/$newName")
            ]);
        } else {
            return $this->failServerError('Failed to move uploaded video.');
        }
    }
    public function uploadImage()
{
    // $authHeader = $this->request->getHeaderLine('Authorization');
    $authHeader = apache_request_headers()["Authorization"];
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
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
            'success' => true,
            'message' => 'Image uploaded successfully',
            'file_name' => $imgName,
            'path' => base_url("uploads/images/$imgName")
        ]);
    } else {
        return $this->response->setStatusCode(500)->setJSON(['error' => 'Failed to move the uploaded image']);
    }
}
}
