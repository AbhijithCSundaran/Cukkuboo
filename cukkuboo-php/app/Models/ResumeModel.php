<?php

namespace App\Models;

use CodeIgniter\Model;

class ResumeModel extends Model
{
    protected $table = 'resume';
    protected $primaryKey = 'resume_id';
    protected $allowedFields = ['user_id', 'mov_id', 'duration', 'created_by', 'created_on', 'modify_by', 'modify_on'];

    public function getHistoryByUserId($userId)
{
    return $this->db->table('resume r')
        ->select('r.mov_id, m.title, m.description, m.thumbnail, r.duration, r.modify_on as viewed_at')
        ->join('movies_details m', 'r.mov_id = m.mov_id')
        ->where('r.user_id', $userId)
        ->orderBy('r.modify_on', 'DESC')
        ->get()
        ->getResult();
}


    public function saveOrUpdate($userId, $movId, $duration)
    {
        $existing = $this->where(['user_id' => $userId, 'mov_id' => $movId])->first();
        $now = date('Y-m-d H:i:s');

        if ($existing) {
            $this->update($existing['resume_id'], [
                'duration' => $duration,
                'modify_by' => $userId,
                'modify_on' => $now
            ]);
        } else {
            return $this->insert([
                'user_id' => $userId,
                'mov_id' => $movId,
                'duration' => $duration,
                'created_by' => $userId,
                'created_on' => $now,
                'modify_by' => $userId,
                'modify_on' => $now
            ]);
        }
    }
}
