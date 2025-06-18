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
            //  'status'       => 1,
            'user_type' => $data['user_type'] ??'Customer',
        ]);

        if (!empty($data['password'])) {
            $userData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        if (!$user_id) {
            if (empty($data['phone']) && empty($data['email'])) {
                return $this->response->setJSON([
                    'status' => false,
                    'message' => 'Phone or email is required.'
                ])->setStatusCode(400);
            }

            if ($this->UserModel->isUserExists($data['phone'] ?? null, $data['email'] ?? null)) {
                return $this->response->setJSON([
                    'status' => false,
                    'message' => 'User already exists.'
                ])->setStatusCode(409);
            }

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
                'status'  => true,
                'message' => 'User registered successfully.',
                'data'    => [
                    'user_id'             => $user['user_id'],
                    'username'            => $user['username'],
                    'email'               => $user['email'],
                    'password'            => $user['password'],
                    'phone'               => $user['phone'],
                    'status'              => $user['status'],
                    'subscription_status' => $user['subscription'],
                    'user_type'           => $user['user_type'],
                    'created_at'          => $user['created_at'],
                    'created_by'          => $created_by,
                    'jwt_token'           => $user['jwt_token']
                ]
            ])->setStatusCode(201);
         } 

      
        else {
            if($authenticatedUser){
                $userData['updated_at'] = date('Y-m-d H:i:s');
                $userData['updated_by'] = $authenticatedUser['user_id'];
                $this->UserModel->updateUser($user_id, $userData);
                return $this->response->setJSON([
                    'status' => true,
                    'message' => 'User updated successfully.',
                    'data' => $userData
                ]);
            }
            else{
                return $this->response->setJSON([
                    'status' => false,
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
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');

        $status = 9;

        // Call model method to update the status
        if ($this->UserModel->deleteUserById($status, $user_id)) {
            return $this->respond([
                'status' => 200,
                'message' => "Movie with ID $user_id marked as deleted successfully."
            ]);
        } else {
            return $this->failServerError("Failed to delete movie with ID $user_id.");
        }
    }


    // Get user details by user_id
public function getUserDetailsById($userId)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $authuser = $this->authService->getAuthenticatedUser($authHeader);
        if(!$authuser) 
            return $this->failUnauthorized('Invalid or missing token.');
    $user = $this->UserModel->getUserById($userId);

    if (!$user) {
        return $this->response->setJSON([
            'status' => false,
            'message' => 'User not found'
        ])->setStatusCode(404);
    }

    return $this->response->setJSON([
        'status' => true,
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
            'status' => true,
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
        'status' => true,
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
            'status' => true,
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
        'status' => true,
        'data'   => $users,
        'total'  => $total
    ]);
}


}