<?php

namespace App\Models;

use CodeIgniter\Model;

class ReelLikeModel extends Model
{
    protected $table = 'reel_like'; 
    protected $primaryKey = 'rlike_id';
    public function getUserReelLike($userId, $reelsId)
{
    return $this->db->table('reel_like')
        ->where(['user_id' => $userId, 'reels_id' => $reelsId])
        ->get()->getRowArray();
}

public function insertUserLike($data)
{
    return $this->db->table('reel_like')->insert($data);
}

// public function updateUserLike($userId, $reelsId, $status)
// {
//     return $this->db->table('reel_like')
//         ->where(['user_id' => $userId, 'reels_id' => $reelsId])
//         ->update(['status' => $status]);
// }
public function updateUserLike($userId, $reelsId, $status)
{
    return $this->db->table('reel_like')
        ->where(['user_id' => $userId, 'reels_id' => $reelsId])
        ->update([
            'status' => $status,
            'modify_by' => $userId, // 👈 this sets who modified it
            'modify_on' => date('Y-m-d H:i:s') // optional but helpful
        ]);
}

public function removeUserLike($userId, $reelsId)
{
    return $this->db->table('reel_like')
        ->where(['user_id' => $userId, 'reels_id' => $reelsId])
        ->delete();
}

public function updateReelLikeCounts($reelsId)
{
    $likes = $this->db->table('reel_like')
        ->where(['reels_id' => $reelsId, 'status' => 1]) // count only likes
        ->countAllResults();

    return $this->db->table('reels')
        ->where('reels_id', $reelsId)
        ->update([
            'likes' => $likes // update only the likes field
        ]);
}

}

