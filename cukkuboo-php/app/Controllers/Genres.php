<?php

namespace App\Controllers;

use App\Models\GenresModel;
use CodeIgniter\RESTful\ResourceController;

class Genres extends ResourceController
{
    protected $genresModel;

    public function __construct()
    {
        // Correct model instance name & class
        $this->genresModel = new GenresModel();
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
    public function delete($genre_id = null)
    {
        if (!$genre_id || !$this->genresModel->genreExists($genre_id)) {
            return $this->failNotFound('Genre not found.');
        }

        $this->genresModel->deleteGenre($genre_id);

        return $this->respondDeleted([
            'success' => true,
            'message' => 'Genre deleted successfully.'
        ]);
    }
}
