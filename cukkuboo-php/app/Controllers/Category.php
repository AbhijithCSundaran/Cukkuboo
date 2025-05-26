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

    public function categorylist()
    {

        // test
        $categories = $this->categoryModel->findAll();

        return $this->response->setJSON([
            'success' => true,
            'data' => $categories
        ]);
    }
    public function create()
    {
        $category_id = $this->input->getPost('category_id');
        $category_name = $this->input->getPost('category_name');

        $data = $this->request->getJSON(true);

        if (empty($data['id']) || empty($data['name'])) {
            return $this->failValidationError('Both ID and Name are required.');
        }

        if ($this->categoryModel->find($data['id'])) {
            return $this->fail('Category with this ID already exists.');
        }

        $this->categoryModel->insert($data);

        return $this->respondCreated([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => $data
        ]);
    }

    // PUT: Update category
    public function update($id = null)
    {
        if (!$id) {
            return $this->failValidationError('ID is required');
        }

        $data = $this->request->getJSON(true);

        if (empty($data['name'])) {
            return $this->failValidationError('Name is required');
        }

        if (!$this->categoryModel->find($id)) {
            return $this->failNotFound('Category not found');
        }

        $this->categoryModel->update($id, ['name' => $data['name']]);

        return $this->respond([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => ['id' => $id, 'name' => $data['name']]
        ]);
    }

    // DELETE: Delete category
    public function delete($id = null)
    {
        if (!$id || !$this->categoryModel->find($id)) {
            return $this->failNotFound('Category not found.');
        }

        $this->categoryModel->delete($id);

        return $this->respondDeleted([
            'success' => true,
            'message' => 'Category deleted successfully.'
        ]);
    }


}
