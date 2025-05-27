<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'categories';
    protected $allowedFields = ['category_id', 'category_name'];
    public $primaryKey = 'category_id';
    public $useAutoIncrement = false;
    public $useTimestamps = false;
}
