<?php

namespace App\Controllers;


use App\Models\UserModel;

class Api extends BaseController
{
     public function __construct() {
        $this->UserModel=new UserModel();
     }
        
    public function index(): string
    {
        return view('welcome_message');
    }

    public function registerFun(){

         $data = $this->request->getJSON(true);
        $email = $data['email'] ?? null;
        

        if ($this->UserModel->isUserExists($data['phone'], $data['email'])) {
            return $this->response->setJSON([
                'status' => 'false',
                'message' => 'Email or phone already exists.'
            ]);
        }

        $useradd = $this->UserModel->addUser($data);
        if($useradd){
        // return $this->response->setJSON($data);

            return $this->response->setJSON([
                'status' => 'true',
                'message' => 'User registered successfully.',
                'data' => setJSON($useradd),
            ]);
        }
        else{
            return $this->response->setJSON([
                'status' => 'false',
                'message' => 'User registration failed.'
            ]);
        }
    }
}