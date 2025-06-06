<?php

namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\MovieDetailsModel;


class MovieDetail extends ResourceController
{


    public function __construct()
    {
        $this->session = \Config\Services::session();
        $this->input = \Config\Services::request();
        $this->moviedetail = new MovieDetailsModel();
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
    public function getAllMovieDetails()
    {
        $pageIndex = (int) $this->request->getGet('pageIndex');
        $pageSize = (int) $this->request->getGet('pageSize');

        // If pageIndex is negative, return all movies without pagination
        if ($pageIndex < 0) {
            $movies = $this->moviedetail
                ->where('status !=', 9)
                ->orderBy('mov_id', 'DESC')
                ->findAll();

            return $this->response->setJSON([
                'status' => true,
                'message' => 'All movies fetched (no pagination).',
                'data' => $movies,
                'total' => count($movies)
            ]);
        }

        // Set fallback/default values
        if ($pageSize <= 0) {
            $pageSize = 10;
        }

        $offset = $pageIndex * $pageSize;

        // Get total matching movies
        $total = $this->moviedetail
            ->where('status !=', 9)
            ->countAllResults(false); // don't reset builder

        // Fetch paginated data
        $movies = $this->moviedetail
            ->where('status !=', 9)
            ->orderBy('mov_id', 'DESC')
            ->findAll($pageSize, $offset);

        // Return response
        return $this->response->setJSON([
            'status' => true,
            'message' => 'Paginated movies fetched successfully.',
            'data' => $movies,
            'total' => $total
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


    // public function deleteMovieDetails()
// {
//     $data = $this->request->getJSON(true); 


    //$modified_by = $data['modified_by'] ?? null;

    // if (!$modified_by) {
    //     return $this->respond([
    //         'status' => 400,
    //          'message' => 'Modified by (user ID) is required.'
    //     ]);
    // }
    // $status = 9;

    // if ($this->moviedetail->deleteMovieDetailsById($status, $data['mov_id'])) {
    //     return $this->respond([
    //         'status' => 200,
    //         'message' => 'Movie marked as deleted successfully.'
    //     ]);
    // } else {
    //     return $this->failServerError('Failed to delete movie.');
    // }
// }
    public function deleteMovieDetails($mov_id)
    {
        // Set status to 9 for soft delete
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



}