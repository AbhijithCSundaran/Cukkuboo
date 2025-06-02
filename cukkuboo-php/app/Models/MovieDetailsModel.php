<?php

namespace App\Models;

use CodeIgniter\Model;

class MovieDetailsModel extends Model
{
    protected $table = 'movies_details'; 

    protected $allowedFields = [
        'upload_video_name', 'title', 'genre', 'description', 'cast_details', 'category',
        'release_date', 'rating', 'access', 'status', 'thumbnail', 'trailer', 'banner',
        'created_by', 'created_on', 'modify_by', 'modify_on'
    ];

     public function addMovie($data)
    {
        return $this->insert($data);
    }
}