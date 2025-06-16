<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\NotificationModel;
use App\Libraries\AuthService;

class Notification extends ResourceController
{
    protected $notificationModel;
    protected $authService;

    public function __construct()
    {
        $this->notificationModel = new NotificationModel();
        $this->authService = new AuthService();
    }

    public function createOrUpdate()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if (!$user) return $this->failUnauthorized('Unauthorized.');

        $data = $this->request->getJSON(true);
        $notificationId = $data['notification_id'] ?? null;

        $notificationData = [
            'user_id'     => $user['user_id'],
            'content'     => $data['content'] ?? '',
            'status'      => $data['status'] ?? 1,
        ];

        if ($notificationId) {
            $notificationData['modify_by'] = $user['user_id'];
            $notificationData['modify_on'] = date('Y-m-d H:i:s');

            $updated = $this->notificationModel->update($notificationId, $notificationData);
            return $this->respond([
                'status' => true,
                'message' => $updated ? 'Notification updated' : 'Update failed'
            ]);
        } else {
            $notificationData['created_by'] = $user['user_id'];
            $notificationData['created_on'] = date('Y-m-d H:i:s');

            $id = $this->notificationModel->insert($notificationData);
            return $this->respond([
                'status' => true,
                'message' => 'Notification created',
                'notification_id' => $id
            ], 201);
        }
    }

    public function getAll()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if (!$user) return $this->failUnauthorized('Unauthorized.');

    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search');

    if ($pageSize <= 0) {
        $pageSize = 10; // default
    }

    $offset = $pageIndex * $pageSize;

    $builder = $this->notificationModel
        ->where('user_id', $user['user_id'])
        ->where('status !=', 9);

    if (!empty($search)) {
        $builder->like('content', $search);
    }

    $total = $builder->countAllResults(false); // don't reset query
    $notifications = $builder->orderBy('created_on', 'DESC')
                             ->findAll($pageSize, $offset);

    return $this->respond([
        'status' => true,
        'data'   => $notifications,
        'total'  => $total,
        'pageIndex' => $pageIndex,
        'pageSize'  => $pageSize
    ]);
}

    public function delete($notification_id = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    if (!$notification_id) {
        return $this->failNotFound('Notification ID not provided.');
    }

    // Use your model's softDelete method (assumed signature: softDelete($notificationId, $userId))
    $deleted = $this->notificationModel->softDelete($notification_id, $user['user_id']);

    if ($deleted) {
        return $this->respondDeleted([
            'status' => true,
            'message' => "Notification with ID $notification_id marked as deleted successfully."
        ]);
    } else {
        return $this->failServerError("Failed to delete notification with ID $notification_id.");
    }
}


   public function markAllAsReadOrUnread()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if (!$user) return $this->failUnauthorized('Unauthorized.');

    $userId = $user['user_id'];

    // Check if any unread notifications (status=1)
    $unreadCount = $this->notificationModel
        ->where('user_id', $userId)
        ->where('status', 1)
        ->countAllResults();

    if ($unreadCount > 0) {
        // Mark unread as read (1 -> 2)
        $this->notificationModel
            ->where('user_id', $userId)
            ->where('status', 1)
            ->set(['status' => 2])
            ->update();

        return $this->respond([
            'status' => true,
            'message' => 'All unread notifications marked as read.',
        ]);
    }

    // Otherwise, check if any read notifications (status=2)
    $readCount = $this->notificationModel
        ->where('user_id', $userId)
        ->where('status', 2)
        ->countAllResults();

    if ($readCount > 0) {
        // Mark read as unread (2 -> 1)
        $this->notificationModel
            ->where('user_id', $userId)
            ->where('status', 2)
            ->set(['status' => 1])
            ->update();

        return $this->respond([
            'status' => true,
            'message' => 'All read notifications marked as unread.',
        ]);
    }

    // No unread or read notifications found
    return $this->respond([
        'status' => true,
        'message' => 'No notifications to update.',
    ]);
}


    public function getById($notification_id)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if (!$user) return $this->failUnauthorized('Unauthorized.');

    $notification = $this->notificationModel
        ->where('notification_id', $notification_id)
        ->where('user_id', $user['user_id'])
        ->where('status !=', 9)  // exclude deleted
        ->first();

    if (!$notification) {
        return $this->failNotFound('Notification not found.');
    }

    return $this->respond([
        'status' => true,
        'data' => $notification
    ]);
}

}
