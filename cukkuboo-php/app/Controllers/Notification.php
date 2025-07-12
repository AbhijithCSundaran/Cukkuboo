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
        if(!$user){ 
            return $this->failUnauthorized('Invalid or missing token.');
        }
        $notificationModel = new NotificationModel();
        $data = $this->request->getJSON(true);
        $notificationId = $data['notification_id'] ?? null;

        $notificationData = [
            'user_id'     => $user['user_id'],
            'title'     => $data['title'] ?? '',
            'content'     => $data['content'] ?? '',
            'status'      => $data['status'] ?? 1,
        ];

        if ($notificationId) {
            $notificationData['modify_by'] = $user['user_id'];
            $notificationData['modify_on'] = date('Y-m-d H:i:s');

            $updated = $this->notificationModel->update($notificationId, $notificationData);
            return $this->respond([
                'success' => true,
                'message' => $updated ? 'Notification updated' : 'Update failed',
                'data' => $notificationData
            ]);
        } else {
            $notificationData['created_by'] = $user['user_id'];
            $notificationData['created_on'] = date('Y-m-d H:i:s');
            $notificationData['status'] = 1;
            $id = $this->notificationModel->insert($notificationData);
            return $this->respond([
                'success' => true,
                'message' => 'Notification created',
                'data' => $notificationData
            ]);
        }
    }

    public function getAllNotifications()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search');

    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;
    $notificationsModel = new notificationModel();
    $data = $notificationsModel->getUserNotifications($pageSize, $offset, $search);

    return $this->respond([
        'success' => true,
        'message' => 'Notifications fetched successfully.',
        'data'    => $data['notifications'],
        'total'   => $data['total']
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
    $deleted = $this->notificationModel->softDelete($notification_id, $user['user_id']);

    if ($deleted) {
        return $this->respondDeleted([
            'success' => true,
            'message' => "Notification with ID $notification_id marked as deleted successfully.",
            'data' => []
        ]);
    } else {
        return $this->failServerError("Failed to delete notification with ID $notification_id.");
    }
    }


   public function markAllAsReadOrUnread()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

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
            'success' => true,
            'message' => 'All unread notifications marked as read.'
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
            'success' => true,
            'message' => 'All read notifications marked as unread.',
        ]);
    }

    // No unread or read notifications found
    return $this->respond([
        'success' => true,
        'message' => 'No notifications to update.',
    ]);
}


    public function getUserNotifications($userId = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    if ($userId === null) {
        $userId = $authUser['user_id'];
    }

    if (!$userId) {
        return $this->failValidationErrors('User ID is required.');
    }

    $pageIndex = (int) $this->request->getGet('pageIndex') ?? 0;
    $pageSize  = (int) $this->request->getGet('pageSize') ?? 10;
    $search    = trim($this->request->getGet('search') ?? '');
    $offset    = $pageIndex * $pageSize;

    // Query builder
    $builder = $this->notificationModel
        ->where('user_id', $userId)
        ->where('status !=', 9);

    if (!empty($search)) {
        $builder->groupStart()
                ->like('title', $search)
                ->orLike('content', $search)
                ->groupEnd();
    }


    $total = $builder->countAllResults(false);

    $notifications = $builder
        ->orderBy('created_on', 'DESC')
        ->limit($pageSize, $offset)
        ->findAll();

    return $this->respond([
        'success' => true,
        'message' => 'Notifications fetched successfully.',
        'total' => $total,
        'data' => $notifications
    ]);
}


public function getNotificationById($notificationId = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authUser = $this->authService->getAuthenticatedUser($authHeader);

    if (!$authUser) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    if ($notificationId === null) {
        return $this->failValidationErrors('Notification ID is required.');
    }
    $this->notificationModel->getById($notificationId);
    $notification = $this->notificationModel->find($notificationId);

    if (!$notification || $notification['status'] == 9) {
        return $this->failNotFound('Notification not found.');
    }

    return $this->respond([
        'success' => true,
        'message' => 'Notification fetched successfully.',
        'data' => $notification
    ]);
}


}
