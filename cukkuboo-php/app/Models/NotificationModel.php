<?php

namespace App\Models;

use CodeIgniter\Model;

class NotificationModel extends Model
{
    protected $table = 'notification'; 
    protected $primaryKey = 'notification_id';
    protected $returnType = 'array';
    protected $useTimestamps = false;
    protected $protectFields = true;

    protected $allowedFields = [
        'user_id',
        'title',
        'content',
        'status',
        'created_by',
        'created_on',
        'modify_by',
        'modify_on',
    ];
 
    public function getUserNotifications($userId)
    {
        return $this->where('user_id', $userId)
                    ->where('status !=', 9)
                    ->orderBy('created_on', 'DESC')
                    ->findAll();
    }

    public function softDelete($notificationId, $userId)
    {
        return $this->where('notification_id', $notificationId)
                    ->where('user_id', $userId)
                    ->set(['status' => 9])
                    ->update();
    }

    public function markAllAsRead($userId)
{
    return $this->where('user_id', $userId)
                ->where('status', 1) 
                ->set(['status' => 2]) 
                ->update();
}

}
