<?php

namespace App\Models;

use CodeIgniter\Model;

class GenresModel extends Model
{
    protected $table = 'genres';
    protected $primaryKey = 'genre_id';
    protected $allowedFields = ['genre_id', 'genre_name', 'description', 'status'];
    
    public $useAutoIncrement = false;
    public $useTimestamps = false;

    // Insert genre
    public function addGenre($data)
    {
        return $this->db->table($this->table)->insert($data);
    }

    // Update genre
    public function updateGenre($genre_id, $data)
    {
        return $this->db->table($this->table)
                        ->where('genre_id', $genre_id)
                        ->update($data);
    }

    // Delete genre
    public function deleteGenere($status,$genre_id)
    {
      return $this->db->query("update genres set status = '".$status."', updated_at=NOW() where genre_id = '".$genre_id."'");
    }

    // Check if genre exists by genre_id
    public function genreExists($genre_id)
    {
        return $this->db->table($this->table)
                        ->where('genre_id', $genre_id)
                        ->get()
                        ->getRow();
    }
}

