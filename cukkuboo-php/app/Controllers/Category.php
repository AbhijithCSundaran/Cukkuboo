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
        ])->setStatusCode(200);
    }

    // POST: Create category
    public function create()
    {
        $data = $this->request->getJSON(true);
 
        if (empty($data['category_id']) || empty($data['category_name'])) {
            return $this->failValidationError('Both category_id and category_name are required.');
        }
 
        if ($this->categoryModel->find($data['category_id'])) {
            return $this->fail('Category with this category_id already exists.');
        }
 
        $this->categoryModel->insert($data);
 
        return $this->respondCreated([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => $data
        ])->setStatusCode(201);
    }
 
    // PUT /categories/{category_id} - Update a category
    public function update($category_id = null)
    {
        if (!$category_id) {
            return $this->failValidationError('category_id is required.');
        }
 
        $data = $this->request->getJSON(true);
 
        if (empty($data['category_name'])) {
            return $this->failValidationError('category_name is required.');
        }
 
        if (!$this->categoryModel->find($category_id)) {
            return $this->failNotFound('Category not found.');
        }
 
        $this->categoryModel->update($category_id, ['category_name' => $data['category_name']]);
 
        return $this->respond([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => [
                'category_id' => $category_id,
                'category_name' => $data['category_name']
            ]
        ]);
    }
 
    // DELETE /categories/{category_id} - Delete a category
    public function delete($category_id = null)
    {
        if (!$category_id || !$this->categoryModel->find($category_id)) {
            return $this->failNotFound('Category not found.');
        }
 
        $this->categoryModel->delete($category_id);
 
        return $this->respondDeleted([
            'success' => true,
            'message' => 'Category deleted successfully.'
        ])->setStatusCode(200);
    }
}
