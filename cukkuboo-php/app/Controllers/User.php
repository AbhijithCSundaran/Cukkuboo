<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;

use App\Models\UserModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;

class User extends ResourceController
{
    protected $UserModel;
    

    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->UserModel = new UserModel();
        $this->authService = new AuthService();
    }

    public function index(): string
    {
        return view('welcome_message');
    }

    public function registerFun()
    {
        $data = $this->request->getJSON(true);

        // Try to get authenticated user from JWT
        $user_id =  $data['user_id']??0;//$this->getAuthenticatedUser();
        $authHeader = $this->request->getHeaderLine('Authorization');
        $authenticatedUser= $this->authService->getAuthenticatedUser($authHeader);
        
        $userData = array_filter([
            'username'     => $data['username'] ?? null,
            'phone'        => $data['phone'] ?? null,
            'email'        => $data['email'] ?? null,
            'password'     => $data['password']?? null,
            'country'      => $data['country'] ?? null,
            'subscription' => $data['subscription'] ?? 'free',
            'status'       => $data['status'] ?? null,
               'join_date'       => $data['join_date'] ?? null,
            //  'status'       => 1,
            'user_type' => $data['user_type'] ??'Customer',
            'date_of_birth'=> $data['date_of_birth'] ?? null        
        ]);

        if (!empty($data['password'])) {
            $userData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        if (!$user_id) {
            if (empty($data['phone']) && empty($data['email'])) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Phone or email is required.'
                ]);
            }

            if ($this->UserModel->isUserExists($data['phone'] ?? null, $data['email'] ?? null)) {
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'User already exists.'
                ]);
            }
            $userData['join_date'] = $userData['join_date'] ?? date('Y-m-d');
            $userData['created_at'] = date('Y-m-d H:i:s');
            $userId = $this->UserModel->addUser($userData);
            $user   = $this->UserModel->find($userId);

            $jwt   = new Jwt();
            $token = $jwt->encode(['user_id' => $user['user_id']]);

            $created_by = $authenticatedUser ? $authenticatedUser['user_id'] : $userId;

            
            $this->UserModel->update($user['user_id'], [
                'created_by' => $created_by,
                'jwt_token'  => $token
            ]);

            
            $user = $this->UserModel->find($userId);

            return $this->response->setJSON([
                'success'  => true,
                'message' => 'User registered successfully.',
                'data'    => [
                    'user_id'             => $user['user_id'],
                    'username'            => $user['username'],
                    'email'               => $user['email'],
                    'password'            => $user['password'],
                    'phone'               => $user['phone'],
                    'status'              => $user['status'],
                    'join_date'           =>$user['join_date'],
                    'date_of_birth' => $user['date_of_birth'], 
                    'subscription_status' => $user['subscription'],
                    'user_type'           => $user['user_type'],
                    'created_at'          => $user['created_at'],
                    'created_by'          => $created_by,
                    'jwt_token'           => $user['jwt_token']
                ]
            ]);
         } 

      
        else {
            if($authenticatedUser){
                $userData['updated_at'] = date('Y-m-d H:i:s');
                $userData['updated_by'] = $authenticatedUser['user_id'];
                $this->UserModel->updateUser($user_id, $userData);
                return $this->response->setJSON([
                    'success' => true,
                    'message' => 'User updated successfully.',
                    'data' => $userData
                ]);
            }
            else{
                return $this->response->setJSON([
                    'success' => false,
                    'message' => 'Unauthorised User',
                    'data' => null
                ]);
            }
        }
    }


    //  Get user details
    // public function getUserDetails()
    // {
    //     $user = $this->getAuthenticatedUser();

    //     if (!$user) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Unauthorized'
    //         ])->setStatusCode(401);
    //     }

    //     return $this->response->setJSON([
    //         'status' => true,
    //         'data' => $user
    //     ]);
    // }


 public function deleteUser($user_id)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    
    if (!$user || $user['user_id'] != $user_id) {
        return $this->failUnauthorized('Unauthorized access or invalid token.');
    }

    $password = $this->request->getJSON()->password;
    if (empty($password)) {
        return $this->failValidationError('Password is required to delete the account.');
    }

    $userData = $this->UserModel->find($user_id);

    if (!$userData) {
        return $this->failNotFound("User not found.");
    }

    if (!password_verify($password, $userData['password'])) {
        return $this->failUnauthorized("Incorrect password. Account not deleted.");
    }
    $status = 9;
    if ($this->UserModel->deleteUserById($status, $user_id)) {
        return $this->respond([
            'success' => true,
            'message' => "User with ID $user_id has been deleted successfully.",
            'data' => []
        ]);
    } else {
        return $this->failServerError("Failed to delete user with ID $user_id.");
    }
}




public function getUserDetailsById($userId = null)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authuser = $this->authService->getAuthenticatedUser($authHeader);
        if(!$authuser) 
            return $this->failUnauthorized('Invalid or missing token.');
        
    if ($userId === null) {
        $userId = $authuser['user_id'];
    }
    $user = $this->UserModel->getUserById($userId);

   
    if (!$user) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'User not found',
            'data'=>[]
        ]);
    }

    return $this->response->setJSON([
        'success' => true,
        'message'=>'success',
        'data' => $user
    ]);
}

public function getUserList()
{
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search');
   
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authuser = $this->authService->getAuthenticatedUser($authHeader);
        if(!$authuser) 
            return $this->failUnauthorized('Invalid or missing token.');
    $userQuery = $this->UserModel->where('status !=', 9)
                                 ->where('user_type', 'customer');

   
    if (!empty($search)) {
        $userQuery->groupStart()
                  ->like('username', $search)         
                  ->orLike('email', $search)
                  ->orLike('phone', $search)
                  ->orLike('country', $search)
                 ->groupEnd();
    }

    if ($pageIndex < 0) {
        $users = $userQuery->orderBy('user_id', 'DESC')->findAll();
        $total = count($users);

        return $this->response->setJSON([
            'success' => true,
            'message'=>'success',
            'data'   => $users,
            'total'  => $total
        ]);
    }

    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    $total = $userQuery->countAllResults(false); 
    $users = $userQuery->orderBy('user_id', 'DESC')
                       ->findAll($pageSize, $offset);

    return $this->response->setJSON([
        'success' => true,
        'message'=>'success',
        'data'   => $users,
        'total'  => $total
    ]);
}

public function getStaffList()
{
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search');
   
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authuser = $this->authService->getAuthenticatedUser($authHeader);
        if(!$authuser) 
            return $this->failUnauthorized('Invalid or missing token.');
    $userQuery = $this->UserModel->where('status !=', 9)
                                 ->where('user_type !=', 'customer');

   
    if (!empty($search)) {
        $userQuery->groupStart()
                  ->like('username', $search)         
                  ->orLike('email', $search)
                  ->orLike('phone', $search)
                  ->orLike('country', $search)
                  ->orLike('user_type', $search)
                 ->groupEnd();
    }

    if ($pageIndex < 0) {
        $users = $userQuery->orderBy('user_id', 'DESC')->findAll();
        $total = count($users);

        return $this->response->setJSON([
            'success' => true,
            'message'=>'success',
            'data'   => $users,
            'total'  => $total
        ]);
    }

    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    $total = $userQuery->countAllResults(false); 
    $users = $userQuery->orderBy('user_id', 'DESC')
                       ->findAll($pageSize, $offset);

    return $this->response->setJSON([
        'success' => true,
        'message'=>'success',
        'data'   => $users,
        'total'  => $total
    ]);
}
public function updateEmailPreference()
{
    $json = $this->request->getJSON(true); 

    $userId = isset($json['user_id']) ? (int)$json['user_id'] : null;
    $status = isset($json['status']) ? (int)$json['status'] : null;

    if (!$userId || !in_array($status, [1, 2], true)) {
        return $this->failValidationErrors('Invalid input. user_id must be valid, and status must be 1 (enable) or 2 (disable).');
    }

    $userModel = new \App\Models\UserModel();
    $user = $userModel->find($userId);

    if (!$user) {
        return $this->failNotFound('User not found.');
    }

    if ((int)$user['email_preference'] === $status) {
        return $this->respond([
            'success'  => true,
            'message' => 'Email preference is already set to this value.',
            'data'=>[]
        ]);
    }

    $updated = $userModel->update($userId, ['email_preference' => $status]);

    if ($updated) {
        return $this->respond([
            'success'  => true,
            'message' => 'Email preference updated successfully.',
            'data'=>[
                'user_id'    => $userId,
                'status'     => $status
            ]
        ]);
    } else {
        return $this->failServerError('Failed to update email preference.');
    }
}


//---------------------------------------Admin Home Display------------------------------------------------//


    public function countActiveUsers()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $authuser = $this->authService->getAuthenticatedUser($authHeader);
        if(!$authuser) 
            return $this->failUnauthorized('Invalid or missing token.');
        $userModel = new UserModel();
        $activeCount = $userModel->countActiveUsers();

        return $this->respond([
            'success' => true,
            'message'=>'success',
            'data' => $activeCount
        ]);
    }
    public function changePassword()
    {
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authuser = $this->authService->getAuthenticatedUser($authHeader);
        if(!$authuser) {
            return $this->failUnauthorized('Invalid or missing token.');
        }
    $userId = $authuser['user_id'] ?? null;
    if (!$userId) {
        return $this->response->setJSON(['status' => 0, 'msg' => 'User not logged in.']);
    }

    $oldPassword     = $this->request->getPost('oldPassword');
    $newPassword     = $this->request->getPost('newPassword');
    $confirmPassword = $this->request->getPost('confirmPassword');

    if (empty($oldPassword) || empty($newPassword) || empty($confirmPassword)) {
        return $this->response->setJSON(['status' => 0, 'msg' => 'All fields are required.']);
    }

    if ($newPassword !== $confirmPassword) {
        return $this->response->setJSON(['status' => 0, 'msg' => 'New password and confirm password do not match.']);
    }

    $user = $this->UserModel->find($userId);

    if (!$user || !password_verify($oldPassword, $user['password'])) {
        return $this->response->setJSON(['status' => 0, 'msg' => 'Old password is incorrect.']);
    }

    $updated = $this->UserModel->update($userId, [
        'password'   => password_hash($newPassword, PASSWORD_BCRYPT),
        'updated_at' => date('Y-m-d H:i:s')
    ]);

    if ($updated) {
        return $this->response->setJSON(['status' => 1, 'msg' => 'Password updated successfully.']);
    }

    return $this->response->setJSON(['status' => 0, 'msg' => 'Failed to update password.']);
    }

}
