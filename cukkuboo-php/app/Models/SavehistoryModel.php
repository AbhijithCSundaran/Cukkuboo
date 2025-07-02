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


   public function getAllUsersCompletedHistory($search = '')
{
    $builder = $this->builder()
        ->select('save_history.*, movies_details.title')
        ->join('movies_details', 'movies_details.mov_id = save_history.mov_id', 'left')
        ->where('save_history.status !=', 9);  

    if (!empty($search)) {
        $builder->like('movies_details.title', $search);
    }

    return $builder;
}


public function getCompletedHistoryById($historyId)
{
    return $this->builder()
        ->select('save_history.*, movies_details.title, movies_details.thumbnail, movies_details.release_date')
        ->join('movies_details', 'movies_details.mov_id = save_history.mov_id', 'left')
        ->where('save_history.save_history_id', $historyId)
        ->where('save_history.status !=', 9)
        ->get()
        ->getRow();  
}


public function softDeleteHistoryById($saveHistoryId)
{
    return $this->where('save_history_id', $saveHistoryId)
                ->where('status !=', 9)
                ->set(['status' => 9, 'modify_on' => date('Y-m-d H:i:s')])
                ->update();
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
    $builder = $this->builder(); 

    $builder->where('user_id', $userId)
            ->where('status !=', 9)
            ->set([
                'status'     => 9,
                'modify_on'  => date('Y-m-d H:i:s'),
                'modify_by'  => $userId
            ]);

    $builder->update();

    return $builder->db()->affectedRows();
}

}

