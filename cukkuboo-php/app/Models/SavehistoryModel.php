<?php

namespace App\Models;

use CodeIgniter\Model;

class SavehistoryModel extends Model
{
    protected $table = 'save_history';
    protected $primaryKey = 'id';
    protected $allowedFields = ['user_id', 'mov_id', 'created_by', 'created_on', 'modify_by', 'modify_on'];

    public function saveCompleted($userId, $movId)
    {
        $existing = $this->where(['user_id' => $userId, 'mov_id' => $movId])->first();
        $now = date('Y-m-d H:i:s');

        if ($existing) {
            return $this->update($existing['history_id'], [
                'modify_by' => $userId,
                'modify_on' => $now
            ]);
        } else {
            return $this->insert([
                'user_id' => $userId,
                'mov_id' => $movId,
                'created_by' => $userId,
                'created_on' => $now,
                'modify_by' => $userId,
                'modify_on' => $now
            ]);
        }
    }

    public function getCompletedHistory($userId)
    {
        return $this->db->table('save_history c')
            ->select('c.mov_id, m.title, m.description, m.thumbnail, c.modify_on as completed_at')
            ->join('movies_details m', 'c.mov_id = m.mov_id')
            ->where('c.user_id', $userId)
            ->orderBy('c.modify_on', 'DESC')
            ->get()
            ->getResult();
    }
}
