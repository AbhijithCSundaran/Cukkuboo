<?php

namespace App\Models;

use CodeIgniter\Model;

class CategoryModel extends Model
{
    protected $table = 'categories';
    protected $allowedFields = ['category_id', 'category_name', 'description', 'status'];
    protected $primaryKey = 'category_id';
    public $useAutoIncrement = false;
    public $useTimestamps = false;

    // Custom Insert
    public function addCategory($data)
    {
        return $this->db->table($this->table)->insert($data);
    }

    // Custom Update
    public function updateCategory($category_id, $data)
    {
        return $this->db->table($this->table)
                        ->where('category_id', $category_id)
                        ->update($data);
    }

    // Custom Delete
    public function deleteCategory($category_id)
    {
        return $this->db->table($this->table)
                        ->where('category_id', $category_id)
                        ->delete();
    }

    // Optional: Check if category exists
    public function categoryExists($category_id)
    {
        return $this->db->table($this->table)
                        ->where('category_id', $category_id)
                        ->get()
                        ->getRow();
    }
}
