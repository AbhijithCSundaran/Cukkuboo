<?php
 
namespace App\Controllers;
use App\Models\LoginModel;
use App\Libraries\AuthService; 
 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
 
 
class Weblogin extends BaseController
{
    protected $authService;
 
    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->loginModel = new LoginModel();
        $this->authService = new AuthService();
    }
 
 
    public function index()
    {
 
        return view('loginFun');
       
    }
 
    public function webReg()
    {
        return view('registerFun');
           
    }
 
    public function webForgot(){
        return view('webforgot');
    }
    public function customerAuthen()
    {   
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }
        $email = $this->request->getPost('cust_Email');
        $password = md5($this->request->getPost('cust_Password'));
        if ($email && $password) {
            $userLog = $this->customerLoginModel->getLoginAccount($email, $password);
            if ($userLog) {
                $this->session->set([
                    'zd_uid' => $userLog->cust_Id,
                    'zd_uname' => $userLog->cust_Name,
                    'role' => 'user',
                ]);
 
                echo json_encode(array(
                    "status" => 1,
                    "msg" => null
                ));
            } else {
                echo json_encode([
                    "status" => 0,
                    "msg" => "Invalid username or password. Please try again!"
                ]);
            }
        } else {
            echo json_encode(array(
                "status" => 0,
                "msg" => "Login credentials are mandatory"
            ));
        }
    }
 
 
 
    public function webForgotEmailSend(){
        $forgotCustEmail = $this->request->getPost("forgotCustEmail");
        if (!$forgotCustEmail) {
            return $this->response->setJSON([
                "status" => 0,
                "msg" => "Enter Your Email Address."
            ]);
        }
        if (!filter_var($forgotCustEmail, FILTER_VALIDATE_EMAIL)) {
            return $this->response->setJSON([
                'status' => 0,
                'msg' => 'Invalid Email Format.'
            ]);
        }
        $emailExist = $this->customerLoginModel->getEmailExist($forgotCustEmail);
        if (!$emailExist) {
            return $this->response->setJSON([
                "status" => 0,
                "msg" => "Email Doesn't Exist."
            ]);
        }
 
        $name = $emailExist->cust_Name;
        $logoUrl = base_url(ASSET_PATH . 'assets/images/logo.jpg');
        $frgtpswd = base_url('forgotPassword?email=' . urlencode($forgotCustEmail));
 
        // Load PHPMailer files
        require 'vendors/src/Exception.php';
        require 'vendors/src/PHPMailer.php';
        require 'vendors/src/SMTP.php';
 
        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
 
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'smartloungework@gmail.com'; // Your Gmail
            $mail->Password   = 'peetkiqeqbgxaxqs'; // App Password
            $mail->SMTPSecure = 'tls';
            $mail->Port       = 587;
 
            $mail->setFrom('smartloungework@gmail.com', 'Smart Lounge');
            $mail->addAddress($forgotCustEmail, $name);
            $mail->addReplyTo('smartloungework@gmail.com', 'Smart Lounge');
 
            $mail->isHTML(true);
            $mail->Subject = 'Password Reset Link - Zakhi Designs';
 
            $mail->Body = "
                <center>
                    <img src='{$logoUrl}' alt='Zakhi Designs Logo' style='height: 60px;'>
                    <h2>Forgot Password</h2>
                </center><br>
                <p style='text-align: center; font-size: 16px; margin-top: 20px;'>
                    <a href='$frgtpswd'>Click Here To Reset The Password.</a>
                </p>
                <p style='text-align: center; margin-top: 20px;'>
                    <a href='https://zakhidesigns.com' style='padding: 10px 20px; background-color: #d81b60; color: white; text-decoration: none; border-radius: 5px;'>Visit Our Website</a>
                </p>
                <p style='text-align: center; font-size: 14px; color: #555; margin-top: 30px;'>
                    For any queries, reach us at <a href='mailto:support@zakhidesigns.com'>support@zakhidesigns.com</a>
                </p>
            ";
 
            $mail->AltBody = "Dear $name,\n\nPlease follow the link to reset your password: $frgtpswd\n\n";
 
            $mail->send();
 
            return $this->response->setJSON([
                'status' => 1,
                'msg' => 'A Reset Link Has Been Sent To Your Email Address.'
            ]);
 
        } catch (Exception $e) {
            return $this->response->setJSON([
                'status' => 0,
                'msg' => 'Mail could not be sent. Mailer Error: ' . $mail->ErrorInfo
            ]);
        }
    }
 
 
    public function logout()
    {
        $session = session();
        $session->remove(['zd_uid', 'zd_uname']);
        return redirect()->to(base_url('/'));
    }
 
 
}
 