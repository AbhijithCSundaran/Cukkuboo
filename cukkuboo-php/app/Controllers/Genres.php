<?php

namespace App\Controllers;

use App\Models\GenresModel;

class Genres extends BaseController
{
    protected $modelName = GenreModel::class;
    protected $format = 'json';

    // GET /genres - List all genres
    public function index()
    {
        $genres = $this->model->getAllGenres();
        return $this->respond(['success' => true, 'data' => $genres]);
    }


    // POST /genres - Create new genre
    public function create()
    {
        $genres_id = $this->input->getPost('genres_id');
        $genres_name = $this->input->getPost('genres_name');
        
        $data = $this->request->getJSON(true);

        if (!isset($data['id']) || !isset($data['name'])) {
            return $this->failValidationError('Missing id or name');
        }

        if ($this->model->find($data['id'])) {
            return $this->fail('Genre with this ID already exists');
        }

        $this->model->insert($data);

        return $this->respondCreated([
            'success' => true,
            'message' => 'Genre created successfully',
            'data' => $data
        ]);
    }

    // PUT /genres/{id} - Update genre
    public function update($id = null)
    {
        if (!$id) {
            return $this->failValidationError('No ID provided');
        }

        $data = $this->request->getJSON(true);

        $genre = $this->model->find($id);
        if (!$genre) {
            return $this->failNotFound('Genre not found');
        }

        $this->model->update($id, $data);

        return $this->respond([
            'success' => true,
            'message' => 'Genre updated successfully',
            'data' => $this->model->find($id)
        ]);
    }

    // DELETE /genres/{id} - Delete genre
    public function delete($id = null)
    {
        if (!$id) {
            return $this->failValidationError('No ID provided');
        }

        $genre = $this->model->find($id);
        if (!$genre) {
            return $this->failNotFound('Genre not found');
        }

        $this->model->delete($id);

        return $this->respondDeleted([
            'success' => true,
            'message' => 'Genre deleted successfully'
        ]);
    }
}
