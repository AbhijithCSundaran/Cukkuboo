<?php

namespace App\Controllers;

use App\Models\GenresModel;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;
use App\Libraries\Jwt;
use App\Libraries\AuthService;

class Genres extends ResourceController
{
    protected $genresModel;

    public function __construct()
    {
        // Correct model instance name & class
        $this->genresModel = new GenresModel();
         $this->UserModel = new UserModel();	
        $this->authService = new AuthService();
    }

    // GET: List all genres
    public function genreList()
    {
        $genres = $this->genresModel->findAll();

        return $this->response->setJSON([
            'success' => true,
            'data' => $genres
        ])->setStatusCode(200);
    }

    // POST: Create new genre
    public function create()
    {
        $data = $this->request->getJSON(true);

        if (
            empty($data['genre_id']) ||
            empty($data['genre_name']) ||
            !isset($data['description']) ||
            !isset($data['status'])
        ) {
            return $this->fail('genre_id, genre_name, description, and status are required.');
        }

        if ($this->genresModel->genreExists($data['genre_id'])) {
            return $this->fail('Genre with this genre_id already exists.');
        }

        $this->genresModel->addGenre($data);

        return $this->respondCreated([
            'success' => true,
            'message' => 'Genre created successfully.',
            'data' => $data
        ]);
    }

    // PUT: Update genre by genre_id
    public function update($genre_id = null)
    {
        if (!$genre_id) {
            return $this->fail('genre_id is required.');
        }

        $data = $this->request->getJSON(true);

        if (
            empty($data['genre_name']) ||
            !isset($data['description']) ||
            !isset($data['status'])
        ) {
            return $this->fail('genre_name, description, and status are required.');
        }

        if (!$this->genresModel->genreExists($genre_id)) {
            return $this->failNotFound('Genre not found.');
        }

        $updateData = [
            'genre_name' => $data['genre_name'],
            'description' => $data['description'],
            'status' => $data['status'],
        ];

        $this->genresModel->updateGenre($genre_id, $updateData);

        return $this->respond([
            'success' => true,
            'message' => 'Genre updated successfully.',
            'data' => [
                'genre_id' => $genre_id,
                'genre_name' => $data['genre_name'],
                'description' => $data['description'],
                'status' => $data['status'],
            ]
        ]);
    }

    // DELETE: Delete genre by genre_id
 public function deleteGenere($genere_id)
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);
        if(!$user) 
            return $this->failUnauthorized('Invalid or missing token.');

        $status = 9;

        // Call model method to update the status
        if ($this->moviedetail->deleteGenere($status, $genere_id)) {
            return $this->respond([
                'status' => 200,
                'message' => "Genere with ID $genere_id marked as deleted successfully."
            ]);
        } else {
            return $this->failServerError("Failed to delete Genere with ID $genere_id.");
        }
    }
}