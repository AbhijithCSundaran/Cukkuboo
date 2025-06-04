<?php

namespace App\Models;

use CodeIgniter\Model;

class MovieDetailsModel extends Model
{
    protected $table = 'movies_details'; 

    protected $allowedFields = [
        'upload_video_name', 'title', 'genre', 'description', 'cast_details', 'category',
        'release_date', 'age_rating', 'access', 'status', 'thumbnail', 'trailer', 'banner', 'duration', 'rating', 'user_type', 
        'created_by', 'created_on', 'modify_by', 'modify_on'
    ];

     public function addMovie($data)
    {
        return $this->insert($data);
    }
    public function updateMovie($mov_id, $data)
{
    return $this->db->table('movies_details')
                    ->where('mov_id', $mov_id)
                    ->update($data);
}
public function getAllMoviesDetails() {
      return $this->db->query('SELECT * FROM movies_details WHERE status != 9')->getResult();
}
public function getMovieDetailsById($id){
     return $this->db->query('select * from movies_details where mov_id="'.$id.'"')->getRowArray();

}
public function deleteMovieDetailsById($status, $mov_id, $modified_by)
		{
			return $this->db->query("update movies_details set status = '".$status."', modify_on=NOW(), modify_by='".$modified_by."' where mov_id = '".$mov_id."'");
		}

           
    public function getFeaturedMovies()
    {
        return $this->where('status', 1)
                    ->orderBy('created_on', 'DESC')
                    ->limit(5)
                    ->findAll();
    }

      public function getTrendingMovies()
    {
        return $this->where('status', 1)
                    ->orderBy('rating', 'DESC')
                    ->limit(5)
                    ->findAll();
    }
}