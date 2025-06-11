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

    //Register new user
    // public function registerFun()
    // {
    //     $data = $this->request->getJSON(true);

    //     if (empty($data['phone']) && empty($data['email'])) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Phone or email is required.'
    //         ])->setStatusCode(400);
    //     }

    //     if ($this->UserModel->isUserExists($data['phone'] ?? null, $data['email'] ?? null)) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'User already exists.'
    //         ])->setStatusCode(409);
    //     }

    //     $userData = [
    //         'username'     => $data['username'] ?? null,
    //         'phone'        => $data['phone'] ?? null,
    //         'email'        => $data['email'] ?? null,
    //         'password'     => !empty($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : null,
    //         'country'      => $data['country'] ?? null,
    //         'status'       => 'active',
    //         'subscription' => 'free',
    //         'join_date'    => date('Y-m-d H:i:s')
    //     ];

    //     $userId = $this->UserModel->addUser($userData);
    //     $user   = $this->UserModel->find($userId);

    //     $jwt    = new Jwt();
    //     $token  = $jwt->encode(['user_id' => $user['user_id']]);

    //     $this->UserModel->update($user['user_id'], ['jwt_token' => $token]);

    //     return $this->response->setJSON([
    //         'status'  => true,
    //         'message' => 'User registered successfully.',
    //         'data'    => [
    //             'user_id'             => $user['user_id'],
    //             'username'            => $user['username'],
    //             'email'               => $user['email'],
    //             'phone'               => $user['phone'],
    //             'subscription_status' => $user['subscription'],
    //             'created_at'          => $user['join_date'],
    //             'jwt_token'           => $token
    //         ]
    //     ])->setStatusCode(201);
    // }

    // // Auth helper
    // public function getAuthenticatedUser()
    // {
    //     $authHeader = $this->request->getHeaderLine('Authorization');
    //     if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
    //         return null;
    //     }

    //     $token = trim(str_replace('Bearer', '', $authHeader));

    //     try {
    //         $jwt     = new Jwt();
    //         $payload = $jwt->decode($token);
    //         $userId  = $payload->user_id ?? null;

    //         $user = $this->UserModel->find($userId);

    //         if (!$user || $user['jwt_token'] !== $token) {
    //             return null;
    //         }

    //         return $user;

    //     } catch (\Exception $e) {
    //         return null;
    //     }
    // }
    public function getAuthenticatedUser()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }

    $token = trim(str_replace('Bearer', '', $authHeader));

    try {
        $jwt     = new Jwt();
        $payload = $jwt->decode($token);
        $userId  = $payload->user_id ?? null;

        $user = $this->UserModel->find($userId);

        if (!$user || $user['jwt_token'] !== $token) {
            return null;
        }

        return $user;

    } catch (\Exception $e) {
        return null;
    }
}

    public function registerFun()
    {
        $data = $this->request->getJSON(true);

        // Try to get authenticated user from JWT
        $user_id =  $data['user_id'];//$this->getAuthenticatedUser();
        $authenticatedUser=$this->getAuthenticatedUser();

        // Shared user data structure
        $userData = array_filter([
            'username'     => $data['username'] ?? null,
            'phone'        => $data['phone'] ?? null,
            'email'        => $data['email'] ?? null,
            'password'     => $data['password']?? null,
            'country'      => $data['country'] ?? null,
            'subscription' => $data['subscription'] ?? 'free',
            'status'       => $data['status'] ?? null,
            'user_type' => $data['user_type'] ??'Customer',
        ]);

        if (!empty($data['password'])) {
            $userData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        // ✅ If NOT authenticated → Register new user
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
            $created_by = $authenticatedUser?$authenticatedUser['user_id']:$userId;
            $this->UserModel->update($user['user_id'], ['created_by' => $created_by]);
            $this->UserModel->update($user['user_id'], ['jwt_token' => $token]);

            return $this->response->setJSON([
                'status'  => true,
                'message' => 'User registered successfully.',
                'data'    => [
                    'user_id'             => $user['user_id'],
                    'username'            => $user['username'],
                    'email'               => $user['email'],
                    'password'            => $user['password'],
                    'phone'               => $user['phone'],
                    'status'               => $user['status'],
                    'subscription_status' => $user['subscription'],
                    'user_type'           => $user['user_type'],
                    'created_at'          => $user['created_at'],
                    'created_by'          => $created_by,
                    'jwt_token'           => $token
                ]
            ])->setStatusCode(201);
        } 

        // ✅ If authenticated → Update existing user
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
    public function getUserDetails()
    {
        $user = $this->getAuthenticatedUser();

        if (!$user) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Unauthorized'
            ])->setStatusCode(401);
        }

        return $this->response->setJSON([
            'status' => true,
            'data' => $user
        ]);
    }

    // Update user details
    // public function updateUser()
    // {
    //     $user = $this->getAuthenticatedUser();

    //     if (!$user) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Unauthorized'
    //         ])->setStatusCode(401);
    //     }

    //     $data = $this->request->getJSON(true);

    //     $updateData = array_filter([
    //         'username' => $data['username'] ?? null,
    //         'phone'    => $data['phone'] ?? null,
    //         'email'    => $data['email'] ?? null,
    //         'country'  => $data['country'] ?? null
    //     ]);

    //     if (!empty($data['password'])) {
    //         $updateData['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    //     }

    //     $this->UserModel->updateUser($user['user_id'], $updateData);

    //     return $this->response->setJSON([
    //         'status' => true,
    //         'message' => 'User updated successfully.'
    //     ]);
    // }

    //  Delete user
    // public function deleteUser()
    // {
    //     $user = $this->getAuthenticatedUser();

    //     if (!$user) {
    //         return $this->response->setJSON([
    //             'status' => false,
    //             'message' => 'Unauthorized'
    //         ])->setStatusCode(401);
    //     }

    //     $this->UserModel->deleteUser($user['user_id']);

    //     return $this->response->setJSON([
    //         'status' => true,
    //         'message' => 'User deleted successfully.'
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
// public function getUserList()
// {
//     // Get pagination parameters from the query string
//     $pageIndex = (int) $this->request->getGet('pageIndex');
//     $pageSize  = (int) $this->request->getGet('pageSize');

//     // If pageIndex is negative, return all users without pagination
//     if ($pageIndex < 0) {
//         $users = $this->UserModel->getAllUsers();
//         $total = count($users);

//         return $this->response->setJSON([
//             'status' => true,
//             'data'   => $users,
//             'total'  => $total
//         ]);
//     }

//     // Validate and fallback
//     if ($pageSize <= 0) {
//         $pageSize = 10; // default size
//     }

//     // Calculate offset
//     $offset = $pageIndex * $pageSize;

//     // Get total user count
//     $total = $this->UserModel->countAll();

//     // Get paginated users
//     $users = $this->UserModel
//         ->orderBy('user_id', 'DESC')
//         ->findAll($pageSize, $offset);

//     return $this->response->setJSON([
//         'status' => true,
//         'data'   => $users,
//         'total'  => $total
//     ]);
// }
public function getUserList()
{
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');

    // Apply status filter
    $userQuery = $this->UserModel->where('status !=', 9);

    if ($pageIndex < 0) {
        // Get all filtered users
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

    // Get total count for filtered users
    $total = $userQuery->countAllResults(false); // false prevents query reset

    // Get paginated, filtered users
    $users = $userQuery
        ->orderBy('user_id', 'DESC')
        ->findAll($pageSize, $offset);

    return $this->response->setJSON([
        'status' => true,
        'data'   => $users,
        'total'  => $total
    ]);
}



}