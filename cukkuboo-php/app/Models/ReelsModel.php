<?php

namespace App\Models;

use CodeIgniter\Model;

class ReelsModel extends Model
{
    protected $table = 'reels'; 
    protected $primaryKey = 'reels_id';

    protected $allowedFields = [
        'title',
        'description',
        'release_date',
        'access',
        'status',
        'thumbnail',
        'views',
        'likes',
        'created_by',
        'created_on',
        'modify_by',
        'modify_on'
    ];

    public function addReel($data)
{
    return $this->insert($data);
}

public function updateReel($reels_id, $data)
{
    return $this->db->table('reels') 
                    ->where('reels_id', $reels_id)
                    ->update($data);
}


    
    public function getAllReels()
    {
        return $this->db->query('SELECT * FROM reels WHERE status != 9')->getResult();
    }
    public function getReelDetailsById($reels_id)
{
    return $this->db
        ->table($this->table)
        ->where($this->primaryKey, $reels_id)
        ->get()
        ->getRowArray();
}
public function deleteReel($reels_id)
{
    return $this->where('reels_id', $reels_id)->delete();
}
}