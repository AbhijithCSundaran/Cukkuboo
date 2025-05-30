<?php
 
namespace App\Libraries;
 
use Firebase\JWT\JWT as FirebaseJWT;
 
class Jwt
{
    private $key = 'your_secret_key'; // Replace with your secret key
 
    public function encode($data, $exp = 3600)
    {
        $issuedAt = time();
        $expirationTime = $issuedAt + $exp;
 
        $token = FirebaseJWT::encode(
            array(
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'data' => $data,
            ),
            $this->key,
            'HS256'
        );
 
        return $token;
    }
 
    public function decode($token)
    {
        try {
            $decoded = FirebaseJWT::decode($token, $this->key, array('HS256'));
            return $decoded->data;
        } catch (\Exception $e) {
            return false;
        }
    }
}
 