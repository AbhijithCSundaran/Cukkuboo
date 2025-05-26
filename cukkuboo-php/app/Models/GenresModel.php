<?php

namespace App\Models;

use CodeIgniter\Model;

class GenresModel extends Model
{
    protected $table = 'genres';
    protected $primaryKey = 'id';
    protected $allowedFields = ['id', 'name'];
    protected $returnType = 'array';
    protected $useTimestamps = false;
}
