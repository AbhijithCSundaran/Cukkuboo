<?php

namespace App\Models;

use CodeIgniter\Model;

class ReelViewModel extends Model
{
    protected $table = 'reel_view';
    protected $primaryKey = 'rview_id';

    public function getUserReelView($userId, $reelsId)
    {
        return $this->db->table($this->table)
            ->where(['user_id' => $userId, 'reels_id' => $reelsId])
            ->get()->getRowArray();
    }

    public function insertUserView($data)
    {
        return $this->db->table($this->table)->insert($data);
    }
public function updateUserView($userId, $reelsId)
{
    return $this->db->table($this->table)
        ->where(['user_id' => $userId, 'reels_id' => $reelsId])
        ->update([
            'modify_on' => date('Y-m-d H:i:s'),
            'modify_by' => $userId
        ]);
}

    public function updateReelViewCount($reelsId)
    {
        $views = $this->db->table($this->table)
            ->where(['reels_id' => $reelsId])
            ->countAllResults();

        return $this->db->table('reels')
            ->where('reels_id', $reelsId)
            ->update(['views' => $views]);
    }
    
}
