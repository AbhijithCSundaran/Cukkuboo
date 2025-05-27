<?php

namespace App\Controllers;

use App\Models\UserModel;

class User extends BaseController
{
    protected $UserModel;

    public function __construct()
    {
        $this->UserModel = new UserModel();
    }

    // Example index method
    public function index()
    {
        return view('welcome_message');
    }

    // Register function for POST /user/register
    public function registerFun()
    {
        // Get JSON input as associative array
        $data = $this->request->getJSON(true);

        if (!$data) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Invalid input.'
            ]);
        }

        // Check if user exists already
        if ($this->UserModel->isUserExists($data['phone'], $data['email'])) {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'Email or phone already exists.'
            ]);
        }

        // Insert user
        $insertId = $this->UserModel->addUser($data);

        if ($insertId) {
            return $this->response->setJSON([
                'status' => true,
                'message' => 'User registered successfully.',
                'user_id' => $insertId,
            ]);
        } else {
            return $this->response->setJSON([
                'status' => false,
                'message' => 'User registration failed.'
            ]);
        }
    }
}


