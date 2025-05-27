<?php

namespace App\Controllers;

use App\Models\CategoryModel;

class Category extends BaseController
{
    protected $categoryModel;

    public function __construct()
    {
        $this->categoryModel = new CategoryModel();
    }

    // GET: List all categories
    public function categorylist()
    {
        $categories = $this->categoryModel->findAll();

        return $this->response->setJSON([
            'success' => true,
            'data' => $categories
        ])->setStatusCode(200);
    }

    // POST: Create category
    public function create()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['id']) || empty($data['name'])) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Both ID and Name are required.'
            ])->setStatusCode(400);
        }

        if ($this->categoryModel->find($data['id'])) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Category with this ID already exists.'
            ])->setStatusCode(409);
        }

        $this->categoryModel->insert($data);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => $data
        ])->setStatusCode(201);
    }

    // PUT: Update category
    public function update($id = null)
    {
        if (!$id) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'ID is required.'
            ])->setStatusCode(400);
        }

        $data = $this->request->getJSON(true);

        if (empty($data['name'])) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Name is required.'
            ])->setStatusCode(400);
        }

        if (!$this->categoryModel->find($id)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Category not found.'
            ])->setStatusCode(404);
        }

        $this->categoryModel->update($id, ['name' => $data['name']]);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => ['id' => $id, 'name' => $data['name']]
        ])->setStatusCode(200);
    }

    // DELETE: Delete category
    public function delete($id = null)
    {
        if (!$id || !$this->categoryModel->find($id)) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Category not found.'
            ])->setStatusCode(404);
        }

        $this->categoryModel->delete($id);

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Category deleted successfully.'
        ])->setStatusCode(200);
    }
}
