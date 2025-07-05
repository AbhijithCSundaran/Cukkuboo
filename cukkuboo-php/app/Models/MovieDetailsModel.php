<?php

namespace App\Models;

use CodeIgniter\Model;

class MovieDetailsModel extends Model
{
    protected $table = 'movies_details'; 
    protected $primaryKey = 'mov_id';
    protected $allowedFields = [
        'video', 'title', 'genre', 'description', 'cast_details', 'category',
        'release_date', 'age_rating', 'access', 'status', 'thumbnail', 'trailer', 'banner', 'duration', 'rating','likes','dislikes', 'user_type', 
        'created_by', 'created_on', 'modify_by', 'modify_on'
    ];

     public function addMovie($data)
    {
        return $this->db->table('movies_details')
                        ->insert($data);
    }
    public function updateMovie($mov_id, $data)
{
    return $this->db->table('movies_details')
                    ->where('mov_id', $mov_id)
                    ->update($data);
}
public function getAllMoviesDetails() {
      return $this->db->query('SELECT * FROM movies_details WHERE status != 9')->getResult();
      
    // return $this->db->query("SELECT * FROM movies_details WHERE status = 1 AND release_date <= CURDATE()"
    // )->getResult();

}
// public function getMovieDetailsById($id){
//      return $this->db->query('select * from movies_details where mov_id="'.$id.'"')->getRowArray();

//}
public function getMovieDetailsById($id)
{
    return $this->where('mov_id', $id)
        ->where('status !=', 9)
        ->select('*, likes, dislikes')  // make sure likes/dislikes are selected
        ->get()
        ->getRowArray();
}

public function deleteMovieDetailsById($status, $mov_id)
{
  return $this->db->query("update movies_details set status = '".$status."', modify_on=NOW() where mov_id = '".$mov_id."'");
}
        
           
  public function getFeaturedMovies()
{
    $results = $this->where('status', 1)
                    ->where('release_date <=', date('Y-m-d'))
                    ->orderBy('rating', 'DESC')
                    ->limit(5)
                    ->findAll();

    foreach ($results as &$row) {
        unset($row['video']);
    }

    return $results;
}

    public function getTrendingMovies()
{
    $results = $this->where('status', 1)
                    ->where('release_date <=', date('Y-m-d'))
                    ->orderBy('rating', 'DESC')
                    ->limit(5)
                    ->findAll();

    foreach ($results as &$row) {
        unset($row['video']);
    }

    return $results;
}


  public function getMoviesWithLimit($limit, $offset)
{
    return $this->db->table($this->table)
                    ->where('status', 1)
                    ->where('release_date <=', date('Y-m-d'))
                    ->orderBy('mov_id', 'DESC')
                    ->limit($limit, $offset)
                    ->get()
                    ->getResultArray();
}


public function countAllMovies()
{
    return $this->db->table($this->table)
                    ->where('status !=', 9)
                    ->countAllResults();
}

//   public function latestMovies()
// {
//     return $this->db->table($this->table)
//                     ->where('status', 1)
//                     ->where('release_date <=', date('Y-m-d'))
//                     ->orderBy('created_on', 'DESC') 
//                     ->limit(10)
//                     ->get()
//                     ->getResultArray();
// }
public function latestMovies()
{
    $results = $this->db->table($this->table)
        ->where('status', 1)
        ->where('release_date <=', date('Y-m-d'))
        ->orderBy('created_on', 'DESC')
        ->limit(10)
        ->get()
        ->getResultArray();

    foreach ($results as &$row) {
        unset($row['video']);
    }

    return $results;
}


public function getMostWatchedMovies()
{
    $results = $this->where('status', 1)
                    ->orderBy('views', 'DESC')
                    ->limit(10)
                    ->findAll();

    foreach ($results as &$row) {
        unset($row['video']);
    }

    return $results;
}


// -------------------------------------Admin home Dispaly----------------------------------------

    public function latestAddedMovies()
    {
        return $this->select('title, release_date')
                ->where('status', 1)
                ->where('release_date <=', date('Y-m-d'))
                ->orderBy('created_on', 'DESC')
                ->limit(10)
                ->findAll();
    }


    public function getMostWatchMovies()
    {
        return $this->select('title,views')  
                    ->where('status', 1)
                    ->orderBy('views', 'DESC')
                    ->limit(10)
                    ->findAll();
    }
    public function countActiveMovies()
    {
        return $this->where('status', 1)->countAllResults();
    }
    public function countInactiveMovies()
    {
        return $this->where('status', 2)->countAllResults();
    }

    // --------------------------------Related Movies Display-----------------------------------------
    public function getRelatedMoviesQuery($currentMovie, $excludeId)
    {
    $builder = $this->builder()
                    ->where('status !=', 9)
                    ->where('mov_id !=', $excludeId);

    $title        = $currentMovie['title'] ?? '';
    $category     = $currentMovie['category'] ?? '';
    $age_rating   = $currentMovie['age_rating'] ?? '';
    $cast_details = $currentMovie['cast_details'] ?? '';

   
    $actors = array_filter(array_map('trim', explode(',', $cast_details)));

    $builder->groupStart();
    if ($category) {
        $builder->orLike('category', $category);
    }
    if ($title) {
        $builder->orLike('title', $title);
    }
    if ($age_rating) {
        $builder->orLike('age_rating', $age_rating);
    }
    foreach ($actors as $actor) {
        $builder->orLike('cast_details', $actor);
    }
    $builder->groupEnd();

    return $builder;
}

public function isInWatchHistory($user_id, $mov_id)
{
    return $this->db->table('save_history')
        ->where('user_id', $user_id)
        ->where('mov_id', $mov_id)
        ->where('status', 1)  
        ->countAllResults() > 0;
}
public function isInWatchLater($user_id, $mov_id)
{
    return $this->db->table('watch_later')
        ->where('user_id', $user_id)
        ->where('mov_id', $mov_id)
        ->where('status', 1)  
        ->countAllResults() > 0;
}


}

