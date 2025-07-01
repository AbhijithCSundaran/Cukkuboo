<?php

namespace App\Models;

use CodeIgniter\Model;

class WatchLaterModel extends Model
{
    protected $table = 'watch_later';
    protected $primaryKey = 'watch_later_id';
    protected $allowedFields = ['user_id', 'mov_id', 'created_by','created_on','modify_by','modify_on'];

    public function addToWatchLater($user_id, $mov_id)
{

    $existing = $this->where('user_id', $user_id)
                     ->where('mov_id', $mov_id)
                     ->first();

    if ($existing) {
        return false;
    }

    return $this->insert([
        'user_id'     => $user_id,
        'mov_id'      => $mov_id,
        'created_by'  => $user_id,
        'created_on'  => date('Y-m-d H:i:s'),
        'modify_on'  => date('Y-m-d H:i:s')
    ]);
}


    public function getWatchLaterByUserId($user_id)
    {
        return $this->select('movies_details.*')
                    ->join('movies_details', 'movies_details.mov_id = watch_later.mov_id')
                    ->where('watch_later.user_id', $user_id)
                    ->findAll();
    }
}
