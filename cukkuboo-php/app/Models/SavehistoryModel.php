<?php

namespace App\Models;

use CodeIgniter\Model;

class SavehistoryModel extends Model
{
    protected $table = 'save_history';
    protected $primaryKey = 'save_history_id';
    protected $allowedFields = ['user_id', 'mov_id','status', 'created_by', 'created_on', 'modify_by', 'modify_on'];

    public function saveCompleted($userId, $movId)
{
    $existing = $this->where(['user_id' => $userId, 'mov_id' => $movId])->first();
    $now = date('Y-m-d H:i:s');

    if ($existing) {
        return $this->update($existing['save_history_id'], [
            'modify_by' => $userId,
            'modify_on' => $now,
            'status'    => 1 
        ]);
    } else {
        return $this->insert([
            'user_id'    => $userId,
            'mov_id'     => $movId,
            'status'     => 1,
            'created_by' => $userId,
            'created_on' => $now,
            'modify_by'  => $userId,
            'modify_on'  => $now
        ]);
    }
}


    public function getAllUsersCompletedHistory()
{
    return $this->db->table('save_history')
        ->select('save_history.*, user.username, movies_details.title, movies_details.thumbnail')
        ->join('user', 'user.user_id = save_history.user_id', 'left')
        ->join('movies_details', 'movies_details.mov_id = save_history.mov_id', 'left');
}


public function getCompletedHistoryById($userId, $movId)
{
    return $this->db->table('save_history c')
        ->select('c.mov_id, m.title, m.description, m.thumbnail, c.modify_on as created_by')
        ->join('movies_details m', 'c.mov_id = m.mov_id')
        ->where('c.user_id', $userId)
        ->where('c.mov_id', $movId)
        ->get()
        ->getRow();
}
public function softDeleteHistory($userId, $movId)
{
    $existing = $this->where([
        'user_id' => $userId,
        'mov_id'  => $movId
    ])->first(); 

    if ($existing && $existing['status'] != 9) {
        return $this->update($existing['save_history_id'], [
            'status'     => 9,
            'modify_by'  => $userId,
            'modify_on'  => date('Y-m-d H:i:s')
        ]);
    }

    return false;
}


public function getCompletedHistory($userId)
    {
        return $this->select('save_history.*, movies_details.title, movies_details.thumbnail') 
                    ->join('movies_details', 'movies_details.mov_id = save_history.mov_id', 'left') 
                    ->where('save_history.user_id', $userId)
                    ->where('save_history.status !=', 9) 
                    ->orderBy('save_history.created_by', 'DESC')
                    ->findAll();
    }
public function softDeleteAllHistoryByUser($userId)
{
    return $this->where('user_id', $userId)
                ->where('status !=', 9)
                ->set(['status' => 9])
                ->update();
}


}

