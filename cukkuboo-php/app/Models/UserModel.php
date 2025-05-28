<?php
 
namespace App\Models;
use CodeIgniter\Model;
 
class UserModel extends Model
{
    // Table name
    protected $table = 'user';
 
    // Primary key (optional but good to include)
    protected $primaryKey = 'user_id';
 
    // Mass assignable fields
    protected $allowedFields = [
        'username',
        'phone',
        'email',
        'password',
        'country',
        'status',
        'join_date',
        'subscription',
        'jwt_token'

    ];
    public function isUserExists($phone, $email)
    {
        return $this->where('phone', $phone)
            ->orWhere('email', $email)
            ->first(); // Uses query builder (safe)
    }
 
    public function addUser($data)
    {
        return $this->insert($data); // Uses Model insert

    

    // public function __construct() {
    //         $this->db = \Config\Database::connect();
    //     }
    // public function isUserExists($phone,$email)
    // {
    //     return $this->db->query("SELECT * FROM user WHERE phone = '".$phone."' OR email = '".$email."'") ->getRow();
    // }
 
    //  public function addUser($data)
    // {
    //     return $this->insert($data);
    // }
}
}
