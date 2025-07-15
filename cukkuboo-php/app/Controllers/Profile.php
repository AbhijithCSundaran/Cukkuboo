<?php
namespace App\Controllers;
use App\Models\AuthModel;
require 'public/mailer/Exception.php';
require 'public/mailer/PHPMailer.php';
require 'public/mailer/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Libraries\AuthService;
use App\Models\LoginModel;

class Profile extends BaseController
{
	public function __construct() {
		
		$this->session = \Config\Services::session();
		$this->input = \Config\Services::request();
		$this->authService = new AuthService();
        $this->loginModel = new LoginModel();
	}
    public function index() {
        if($this->session->get('user_id')) {
			$data['user'] = $this->session->get('username');
			$data['email'] = $this->session->get('email');
			// $data['utype'] = $this->session->get('us_type');
			// $data['menu'] = 1;
			// $data['getTeam'] = $this->AuthModel->getTeamMembers();
			// $data['desArr'] = array("1"=>'Management',"2"=>"Team Lead","3"=>"Developer/Designer","4"=>"QA","5"=>"Guest","6"=>"Client");
			// $data['viewArr'] = array("2"=>'Admin Access',"3"=>'Restricted Access',"4"=>"All Access","5"=>"Guest Access","6"=>"Client Access");
			$template = view('common/header', $data);
			$template .= view('common/leftmenu');
			$template .= view('user');
			$template .= view('common/footer');
			$template .= view('pagescripts/user');
			return $template;
		}
		else {
			$data = ['user_id','username','email'];
			session()->remove($data);
			return redirect()->to(base_url()); 
		}
	}
	public function resetPassword()
{
    $json = $this->request->getJSON(true);

    $email = isset($json['email']) ? trim($json['email']) : null;
    $otpInput = isset($json['otp']) ? trim($json['otp']) : null;
    $newPassword = isset($json['new_password']) ? $json['new_password'] : null;
    $confirmPassword = isset($json['confirm_password']) ? $json['confirm_password'] : null;

    if (!$email) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Email is required.'
        ]);
    }

    $user = $this->loginModel->where('email', $email)->first();
    if (!$user) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'User not found.'
        ]);
    }
    if ($email && !$otpInput && !$newPassword && !$confirmPassword) {
        $otp = rand(100000, 999999);
        session()->set('reset_otp_' . $email, $otp);
        session()->set('otp_expiry_' . $email, time() + 300); 

        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = 'mail.smartlounge.online';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'no-reply@smartlounge.online';
            $mail->Password   = 'JujjmH9WkpL7AgP4TgHe';
            $mail->SMTPSecure = 'ssl';
            $mail->Port       = 465;
            $mail->setFrom('no-reply@smartlounge.online', 'Promat');
            $mail->addAddress($email, $user['username']);
            $mail->isHTML(true);
            $mail->Subject = "OTP for Password Reset - Promat";
            $mail->Body = "
                <p>Hello " . ucwords($user['username']) . ",</p>
                <p>Your OTP is: <strong>$otp</strong></p>
                <p>This OTP will expire in 5 minutes.</p>
                <p>Regards,<br>Promat Team</p>
            ";
            $mail->send();

            return $this->response->setJSON([
                'success' => true,
                'message' => 'OTP sent to your email.'
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Mail error: ' . $mail->ErrorInfo
            ]);
        }
    }
    if ($email && $otpInput && !$newPassword && !$confirmPassword) {
        $storedOtp = session()->get('reset_otp_' . $email);
        $otpExpiry = session()->get('otp_expiry_' . $email);

        if (!$storedOtp || !$otpExpiry || time() > $otpExpiry) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'OTP expired or not found. Please request a new OTP.'
            ]);
        }

        if ($otpInput != $storedOtp) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Invalid OTP. Please enter the correct OTP.'
            ]);
        }

        session()->set('otp_verified_' . $email, true);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'OTP verified. You may now reset your password.'
        ]);
    }
    if ($email && $otpInput && $newPassword && $confirmPassword) {
        $storedOtp = session()->get('reset_otp_' . $email);
        $otpExpiry = session()->get('otp_expiry_' . $email);
        $otpVerified = session()->get('otp_verified_' . $email);

        if (!$storedOtp || !$otpExpiry || time() > $otpExpiry || $otpInput != $storedOtp || !$otpVerified) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Invalid OTP or session expired. Please try again.'
            ]);
        }

        if ($newPassword !== $confirmPassword) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'New password and confirm password do not match.'
            ]);
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        $this->loginModel->update($user['user_id'], ['password' => $hashedPassword]);
        session()->remove('reset_otp_' . $email);
        session()->remove('otp_expiry_' . $email);
        session()->remove('otp_verified_' . $email);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Password has been reset successfully.'
        ]);
    }
    return $this->response->setJSON([
        'success' => false,
        'message' => 'Invalid request payload.'
    ]);
}

	public function removeUser() {
    $userId = $this->input->getPost('userId');
    $this->AuthModel->delUser($userId);
    if ($this->session->get('user_id') == $userId) {
        $this->session->destroy();
    }

    echo json_encode(1);
}

}