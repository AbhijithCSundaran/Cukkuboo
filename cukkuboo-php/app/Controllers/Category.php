<?php

namespace App\Controllers;

use App\Models\CategoryModel;
use CodeIgniter\RESTful\ResourceController;

class Category extends ResourceController
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

        if (
            empty($data['category_id']) ||
            empty($data['category_name']) ||
            !isset($data['description']) ||
            !isset($data['status'])
        ) {
            return $this->failValidationError('category_id, category_name, description, and status are required.');
        }

        if ($this->categoryModel->categoryExists($data['category_id'])) {
            return $this->fail('Category with this category_id already exists.');
        }

        $this->categoryModel->addCategory($data);

        return $this->respondCreated([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => $data
        ]);
    }

    // PUT: Update category
    public function update($category_id = null)
    {
        if (!$category_id) {
            return $this->failValidationError('category_id is required.');
        }

        $data = $this->request->getJSON(true);

        if (
            empty($data['category_name']) ||
            !isset($data['description']) ||
            !isset($data['status'])
        ) {
            return $this->failValidationError('category_name, description, and status are required.');
        }

        if (!$this->categoryModel->categoryExists($category_id)) {
            return $this->failNotFound('Category not found.');
        }

        $updateData = [
            'category_name' => $data['category_name'],
            'description'   => $data['description'],
            'status'        => $data['status'],
        ];

        $this->categoryModel->updateCategory($category_id, $updateData);

        return $this->respond([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => [
                'category_id'   => $category_id,
                'category_name' => $data['category_name'],
                'description'   => $data['description'],
                'status'        => $data['status'],
            ]
        ]);
    }

    // DELETE: Remove category
    public function delete($category_id = null)
    {
        if (!$category_id || !$this->categoryModel->categoryExists($category_id)) {
            return $this->failNotFound('Category not found.');
        }

        $this->categoryModel->deleteCategory($category_id);

        return $this->respondDeleted([
            'success' => true,
            'message' => 'Category deleted successfully.'
        ]);
    }
}
