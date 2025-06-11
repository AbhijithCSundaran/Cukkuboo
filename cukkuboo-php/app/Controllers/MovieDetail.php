<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\MovieDetailsModel;
use App\Models\UserModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;


class MovieDetail extends ResourceController
{


    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->moviedetail = new MovieDetailsModel();
        $this->UserModel = new UserModel();	
        $this->authService = new AuthService();
    }



    public function store()
    {
        $data = $this->request->getJSON(true);

        $movie_id = $data['mov_id'] ?? null;

        $moviedata = [

            'video' => $data['video'] ?? null,

            'title' => $data['title'] ?? null,
            'genre' => $data['genre'] ?? null,
            'description' => $data['description'] ?? null,
            'cast_details' => $data['cast_details'] ?? null,
            'category' => $data['category'] ?? null,
            'release_date' => $data['release_date'] ?? null,
            'age_rating' => $data['age_rating'] ?? null,
            'access' => $data['access'] ?? null,
            'status' => $data['status'] ?? null,
            'thumbnail' => $data['thumbnail'] ?? null,
            'trailer' => $data['trailer'] ?? null,
            'banner' => $data['banner'] ?? null,
            'duration' => $data['duration'] ?? null,
            'rating' => $data['rating'] ?? null,
            'modify_on' => date('Y-m-d H:i:s'),
        ];
        if (empty($movie_id)) {
            $moviedata['created_by'] =
                $data['created_by'] ?? null;
            $moviedata['created_on'] = date('Y-m-d H:i:s');

            if ($this->moviedetail->addMovie($moviedata)) {
                return $this->respond([
                    'status' => 200,
                    'message' => 'Movie added successfully',
                    'data' => $moviedata
                ]);
            } else {
                return $this->failServerError('Failed to add movie');
            }
        } else {

            if ($this->moviedetail->updateMovie($movie_id, $moviedata)) {
                return $this->respond([
                    'status' => 200,
                    'message' => 'Movie updated successfully',
                    'data' => $moviedata
                ]);
            } else {
                return $this->failServerError('Failed to update movie');
            }
        }
    }
   public function getAllSubscriptions()
{
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search'); 
    $userId = $this->request->getGet('user_id');
    $subscriptionId = $this->request->getGet('subscription_id');

    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    // Build query
    $builder = $this->usersubModel->where('status !=', 9);

    if (!empty($userId)) {
        $builder->where('user_id', $userId);
    }

    if (!empty($subscriptionId)) {
        $builder->where('subscription_id', $subscriptionId);
    }

    // If search keyword is provided, apply LIKE condition
  if (!empty($search)) {
    $builder->groupStart()
        ->like('title', $search)
        ->orLike('genre', $search)
        ->orLike('cast_details', $search)
        ->orLike('category', $search)
    ->groupEnd();
}

    // If no pagination
    if ($pageIndex < 0) {
        $subscriptions = $builder
            ->orderBy('user_subscription_id', 'DESC')
            ->findAll();

        return $this->respond([
            'status' => true,
            'data'   => $subscriptions,
            'total'  => count($subscriptions)
        ]);
    }

    $total = $builder->countAllResults(false); // keep builder state

    $subscriptions = $builder
        ->orderBy('user_subscription_id', 'DESC')
        ->findAll($pageSize, $offset);

    return $this->respond([
        'status' => true,
        'data'   => $subscriptions,
        'total'  => $total
    ]);
}

   public function getMovieById($id)
    {

        $getmoviesdetails = $this->moviedetail->getMovieDetailsById($id);
        return $this->response->setJSON([
            'status' => true,
            'message' => 'movie details fetched successfully.',
            'data' => $getmoviesdetails
        ]);
    }

    public function deleteMovieDetails($mov_id)
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');

        $status = 9;

        // Call model method to update the status
        if ($this->moviedetail->deleteMovieDetailsById($status, $mov_id)) {
            return $this->respond([
                'status' => 200,
                'message' => "Movie with ID $mov_id marked as deleted successfully."
            ]);
        } else {
            return $this->failServerError("Failed to delete movie with ID $mov_id.");
        }
    }









// --------------------------------- mobile--------------------------------------//



   public function homeDisplay()
    {
        $movieModel = new MovieDetailsModel();

        $featured = $movieModel->getFeaturedMovies();
        $trending = $movieModel->getTrendingMovies();

        // Dummy resume watching data — replace with actual user progress logic
        // $resumeWatching = [
        //     [
        //         "id" => "series_123",
        //         "title" => "Narcos",
        //         "poster" => "https://cdn.cukkuboo.com/posters/narcos.jpg",
        //         "progress" => 0.65,
        //         "episode" => "S01E02",
        //         "duration" => "55m"
        //     ]
        // ];

        return $this->respond([
            'success' => true,
            'data' => [
                'featured' => array_map([$this, 'formatMovie'], $featured),
                // 'resume_watching' => $resumeWatching,
                'trending_now' => array_map([$this, 'formatTrending'], $trending),
            ]
        ]);
    }

    private function formatMovie($movie)
    {
        // print_r($movie);
        // exit;
        return [
            'mov_id' => $movie['mov_id'],
            'video' => $movie['video'],
            'title' => $movie['title'],
            'cast_details' => $movie['cast_details'],
            'category' => $movie['category'],
            'release_date' => $movie['release_date'],
            'age_rating' => $movie['age_rating'],
            'access' => $movie['access'],
            'trailer' => $movie['trailer'],
            'banner' => $movie['banner'],
            'thumbnail' => $movie['thumbnail'],
            'rating' => (float) $movie['rating'],
            'duration' => $movie['duration'],
            'genre' => explode(',', $movie['genre']),
            'description' => $movie['description']
        ];
    }

    private function formatTrending($movie)
    {
        return [
            'mov_id' => $movie['mov_id'],
            'video' => $movie['video'],
            'title' => $movie['title'],
            'cast_details' => $movie['cast_details'],
            'category' => $movie['category'],
            'release_date' => $movie['release_date'],
            'age_rating' => $movie['age_rating'],
            'access' => $movie['access'],
            'trailer' => $movie['trailer'],
            'banner' => $movie['banner'],
            'thumbnail' => $movie['thumbnail'],
            'rating' => (float) $movie['rating'],
            'duration' => $movie['duration'],
            'genre' => explode(',', $movie['genre']),
            'description' => $movie['description']
        ];
    }

 public function getLatestMovies()
{
    $movieModel = new \App\Models\MovieDetailsModel();
    $latestmovies = $movieModel->latestMovies();

    return $this->response->setJSON([
        'success' => true,
        'data' => $latestmovies
    ]);
}


}