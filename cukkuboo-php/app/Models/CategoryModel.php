<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'categories';
    protected $allowedFields = ['id', 'name'];
    public $primaryKey = 'id';
    public $useAutoIncrement = false;
    public $useTimestamps = false;
}
