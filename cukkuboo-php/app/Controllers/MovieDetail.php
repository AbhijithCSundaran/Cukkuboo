<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\MovieDetailsModel;


class MovieDetail extends ResourceController
{
   

    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->moviedetail = new MovieDetailsModel();
    }

   public function store()
    {
        $data = [
            'upload_video_name' => $this->request->getPost('upload_video_name'),
            'title'             => $this->request->getPost('title'),
            'genre'             => $this->request->getPost('genre'),
            'description'       => $this->request->getPost('description'),
            'cast_details'      => $this->request->getPost('cast_details'),
            'category'          => $this->request->getPost('category'),
            'release_date'      => $this->request->getPost('release_date'),
            'rating'            => $this->request->getPost('rating'),
            'access'            => $this->request->getPost('access'),
            'status'            => $this->request->getPost('status'),
            'thumbnail'         => $this->request->getPost('thumbnail'),
            'trailer'           => $this->request->getPost('trailer'),
            'banner'            => $this->request->getPost('banner'),
            'created_by'        => $this->request->getPost('created_by'),
            'created_on'        => date('Y-m-d H:i:s'),
            'modify_by'         => $this->request->getPost('modify_by'),
            'modify_on'         => $this->request->getPost('modify_on')
        ];

        if ($this->moviedetail->addMovie($data)) {
            return $this->respond(['status' => 200, 'message' => 'Movie added successfully']);
        } else {
            return $this->failServerError('Failed to add movie');
        }
    }

}