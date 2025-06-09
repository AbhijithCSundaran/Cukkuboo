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
public function saveCategory()
{
    $data = $this->request->getJSON(true);

    $category_id = $data['category_id'] ?? null;

    if (
        empty($data['category_name']) ||
        !isset($data['description']) ||
        !isset($data['status'])
    ) {
        return $this->failValidationError('category_name, description, and status are required.');
    }

    $categoryData = [
        'category_name' => $data['category_name'],
        'description'   => $data['description'],
        'status'        => $data['status'],
    ];

    // CREATE
    if (empty($category_id)) {
        if ($this->categoryModel->categoryExists($data['category_name'])) {
            return $this->fail('Category with this category_name already exists.');
        }

        $this->categoryModel->addCategory($categoryData);

        return $this->respondCreated([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => $categoryData
        ]);
    }

    // UPDATE
    else {
        if (!$this->categoryModel->categoryExists($category_id)) {
            return $this->failNotFound('Category not found.');
        }

        $this->categoryModel->updateCategory($category_id, $categoryData);

        return $this->respond([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => array_merge(['category_id' => $category_id], $categoryData)
        ]);
    }
}

    // POST: Create category
    // public function create()
    // {
    //     $data = $this->request->getJSON(true);

    //     if (
           
    //         empty($data['category_name']) ||
    //         !isset($data['description']) ||
    //         !isset($data['status'])
    //     ) {
    //         return $this->failValidationError('category_name, description, and status are required.');
    //     }

    //     if ($this->categoryModel->categoryExists($data['category_name'])) {
    //         return $this->fail('Category with this category_name already exists.');
    //     }

    //     $this->categoryModel->addCategory($data);

    //     return $this->respondCreated([
    //         'success' => true,
    //         'message' => 'Category created successfully.',
    //         'data' => $data
    //     ]);
    // }

    // // PUT: Update category
    // public function update($category_id = null)
    // {
    //     if (!$category_id) {
    //         return $this->failValidationError('category_id is required.');
    //     }

    //     $data = $this->request->getJSON(true);

    //     if (
    //         empty($data['category_name']) ||
    //         !isset($data['description']) ||
    //         !isset($data['status'])
    //     ) {
    //         return $this->failValidationError('category_name, description, and status are required.');
    //     }

    //     if (!$this->categoryModel->categoryExists($category_id)) {
    //         return $this->failNotFound('Category not found.');
    //     }

    //     $updateData = [
    //         'category_name' => $data['category_name'],
    //         'description'   => $data['description'],
    //         'status'        => $data['status'],
    //     ];

    //     $this->categoryModel->updateCategory($category_id, $updateData);

    //     return $this->respond([
    //         'success' => true,
    //         'message' => 'Category updated successfully.',
    //         'data' => [
    //             'category_id'   => $category_id,
    //             'category_name' => $data['category_name'],
    //             'description'   => $data['description'],
    //             'status'        => $data['status'],
    //         ]
    //     ]);
    // }

    public function categorylist()
{
    // Get pagination parameters from query string
    $pageIndex = (int) $this->request->getGet('pageIndex');
    $pageSize  = (int) $this->request->getGet('pageSize');

    // If pageIndex is negative, return all categories
    if ($pageIndex < 0) {
        $categories = $this->categoryModel->orderBy('category_id', 'DESC')->findAll();
        $total      = count($categories);

        return $this->response->setJSON([
            'success' => true,
            'data'    => $categories,
            'total'   => $total
        ]);
    }

    // Fallback/default values
    if ($pageSize <= 0) {
        $pageSize = 10;
    }

    $offset = $pageIndex * $pageSize;

    // Total number of records
    $total = $this->categoryModel->countAll();

    // Paginated fetch
    $categories = $this->categoryModel
        ->orderBy('category_id', 'DESC')
        ->findAll($pageSize, $offset);

    return $this->response->setJSON([
        'success' => true,
        'data'    => $categories,
        'total'   => $total
    ]);
}

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
