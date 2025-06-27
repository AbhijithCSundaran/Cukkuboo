<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\MovieDetailsModel;
use App\Models\UserModel;
use App\Models\SubscriptionPlanModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;


class MovieDetail extends ResourceController
{


    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->moviedetail = new MovieDetailsModel();
        $this->subscriptionPlanModel = new SubscriptionPlanModel();
        $this->userModel = new UserModel();	
        $this->authService = new AuthService();
    }



    public function store()
    {
       $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');

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
            $moviedata['created_by'] =$data['created_by'] ?? null;
            $moviedata['created_on'] = date('Y-m-d H:i:s');

            if ($this->moviedetail->addMovie($moviedata)) {
                return $this->respond([
                    'success' => true,
                    'message' => 'Movie added successfully',
                    'data' => $moviedata
                ]);
            } else {
                return $this->failServerError('Failed to add movie');
            }
        } else {

            if ($this->moviedetail->updateMovie($movie_id, $moviedata)) {
                return $this->respond([
                    'success' => true,
                    'message' => 'Movie updated successfully',
                    'data' => $moviedata
                ]);
            } else {
                return $this->failServerError('Failed to update movie');
            }
        }
    }

public function getAllMovieDetails()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if (!$user) 
        return $this->failUnauthorized('Invalid or missing token.');

    $pageIndex = $this->request->getGet('pageIndex');
    $pageSize  = $this->request->getGet('pageSize');
    $search    = $this->request->getGet('search');

    $builder = $this->moviedetail->where('status !=', 9);

    if (!empty($search)) {
        $search = preg_replace('/\s+/', ' ', $search);
        $searchWildcard = '%' . str_replace(' ', '%', $search) . '%';
        // $builder->groupStart()
        //     ->like('title', $search)
        //     ->orLike('genre', $search)
        //     ->orLike('cast_details', $search)
        //     ->orLike('category', $search)
        // ->groupEnd();
        $builder->groupStart()
            ->like('LOWER(title)', strtolower($searchWildcard))
            ->orLike('LOWER(genre)', strtolower($searchWildcard))
            ->orLike('LOWER(cast_details)', strtolower($searchWildcard))
            ->orLike('LOWER(category)', strtolower($searchWildcard))
        ->groupEnd();
    }
    if (!is_numeric($pageIndex) || !is_numeric($pageSize) || $pageIndex < 0 || $pageSize <= 0) {
        $movies = $builder
            ->orderBy('mov_id', 'DESC')
            ->findAll();

        return $this->response->setJSON([
            'success' => true,
            'message' => 'All movies fetched (no pagination).',
            'data' => $movies,
            'total' => count($movies)
        ]);
    }

    $pageIndex = (int) $pageIndex;
    $pageSize  = (int) $pageSize;
    $offset    = $pageIndex * $pageSize;

    $countBuilder = clone $builder;
    $total = $countBuilder->countAllResults(false);

    $movies = $builder
        ->orderBy('mov_id', 'DESC')
        ->findAll($pageSize, $offset);

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Paginated movies fetched successfully.',
        'data' => $movies,
        'total' => $total
    ]);
}


    public function getMovieById($id)
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
        $getmoviesdetails = $this->moviedetail->getMovieDetailsById($id);
        return $this->response->setJSON([
            'success' => true,
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
                'success' => true,
                'message' => "Movie with ID $mov_id marked as deleted successfully.",
                'data' => []
            ]);
        } else {
            return $this->failServerError("Failed to delete movie with ID $mov_id.");
        }
    }









// --------------------------------- mobile--------------------------------------//



   public function homeDisplay()
{
    $movieModel = new MovieDetailsModel();

    $featuredRaw = $movieModel->getFeaturedMovies();
    $trendingRaw = $movieModel->getTrendingMovies();

    $featured = array_map([$this, 'formatMovie'], $featuredRaw);
    $trending = array_map([$this, 'formatTrending'], $trendingRaw);

    return $this->respond([
        'success' => true,
        'message'=>'success',
        'data' => [
            'list_1' => $featured,
            'list_2' => $trending,
        ]
    ]);
}


    private function formatMovie($movie)
{
    return [
        'mov_id' => $movie['mov_id'],
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
    $latestRaw = $movieModel->latestMovies();

    $latest = array_map([$this, 'formatMovie'], $latestRaw);

    return $this->response->setJSON([
        'success' => true,
        'message'=>'success',
        'data' => $latest
    ]);
}

public function mostWatchedMovies()
{
    $movieModel = new MovieDetailsModel();
    $moviesRaw = $movieModel->getMostWatchedMovies(); 

    $movies = array_map([$this, 'formatMovie'], $moviesRaw);

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Top 10 most watched movies fetched successfully.',
        'data' => $movies
    ]);
}



// ---------------------------------Admin home  Display--------------------------------------//

public function latestMovies()
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);
    if (!$user) 
        return $this->failUnauthorized('Invalid or missing token.');
    $movieModel = new \App\Models\MovieDetailsModel();
    $latestMovies = $movieModel->latestAddedMovies();

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Latest movies fetched successfully.',
        'data' => $latestMovies
    ]);
}
    public function getMostWatchMovies()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if (!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
        $movieModel = new MovieDetailsModel();
        $mostWatched = $movieModel->getMostWatchMovies();

        return $this->response->setJSON([
            'success'  => true,
            'message' => 'Most watched movies fetched successfully.',
            'data' => $mostWatched
        ]);
    }
    public function countActiveMovies()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if (!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
        $movieModel = new MovieDetailsModel();
        $activeCount = $movieModel->countActiveMovies();

        return $this->respond([
            'success' => true,
            'message'=>'success',
            'data' => $activeCount
        ]);
    }
    public function countInactiveMovie()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if (!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
        $movieModel = new MovieDetailsModel();
        $inactiveCount = $movieModel->countInactiveMovies();

        return $this->respond([
            'success' => true,
            'message'=>'success',
            'data' => $inactiveCount
        ]);
    }

    public function getUserHomeData()
    {
    // $authHeader = $this->request->getHeaderLine('Authorization');
    // $user = $this->authService->getAuthenticatedUser($authHeader);

    // if (!$user) {
    //     return $this->failUnauthorized('Invalid or missing token.');
    // }
    
    
    return $this->respond([
        'success' => true,
        'message' => true,
        'data' => [
            'active_movie_count' => $this->moviedetail->countActiveMovies(),
            'In_active_movie_count' => $this->moviedetail->countInactiveMovies(),
            'list_1' => [
                'heading' => 'Featured Movies',
                'data' => $this->moviedetail->getFeaturedMovies()
            ],
            'list_2' => [
                'heading' => 'Trending Movies',
                'data' => $this->moviedetail->getTrendingMovies()
            ],
            'list_3' => [
                'heading' => 'Latest Movies',
                'data' => $this->moviedetail->latestMovies()
            ],
            'list_4' => [
                'heading' => 'Most Watched Movies',
                'data' => $this->moviedetail->getMostWatchedMovies()
            ]
            
        ]
    ]);
}

    public function getAdminDashBoardData()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if (!$user) 
            return $this->failUnauthorized('Invalid or missing token.');
        
        return $this->respond([
            'success' => true,
            'message' => true,
            'data' => [
                'active_user_count'=>$this->userModel->countActiveUsers(),
                'subscriber_count'=>$this->subscriptionPlanModel->countCurrentMonthSubscribers(),
                'active_movie_count' => $this->moviedetail->countActiveMovies(),
                'In_active_movie_count' => $this->moviedetail->countInactiveMovies(),
                'latest_movies' =>$this->moviedetail->latestAddedMovies(),
                'most_watched_movies'=>$this->moviedetail->getMostWatchMovies()
            ]
        ]);
    }
// ------------------------------------Related Movies Display---------------------------

public function getRelatedMovies($id)
{
    $authHeader = $this->request->getHeaderLine('Authorization');
    $user = $this->authService->getAuthenticatedUser($authHeader);

    if (!$user) {
        return $this->failUnauthorized('Invalid or missing token.');
    }

    $currentMovie = $this->moviedetail->find($id);
    if (!$currentMovie) {
        return $this->response->setJSON([
            'success' => false,
            'message' => 'Movie not found.',
            'data' => []
        ]);
    }


    $pageIndex = (int) $this->request->getGet('pageIndex', FILTER_VALIDATE_INT);
    $pageSize  = (int) $this->request->getGet('pageSize', FILTER_VALIDATE_INT);
    $offset = $pageIndex * $pageSize;

    $queryBuilder = $this->moviedetail->getRelatedMoviesQuery($currentMovie, $id);

    $relatedMovies = $queryBuilder
                        ->orderBy('mov_id', 'DESC')
                        ->get($pageSize, $offset)
                        ->getResultArray();

    return $this->response->setJSON([
        'success' => true,
        'message' => 'Related movies fetched successfully.',
        'data' => $relatedMovies
    ]);
}

}