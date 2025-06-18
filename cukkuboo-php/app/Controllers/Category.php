<?php

namespace App\Controllers;

use App\Models\CategoryModel;
use CodeIgniter\RESTful\ResourceController;
use App\Libraries\Jwt;
use App\Libraries\AuthService;

class Category extends ResourceController
{
    protected $categoryModel;
    protected $authService;

    public function __construct()
    {
        $this->categoryModel = new CategoryModel();
        $this->authService = new AuthService();
    }

    public function saveCategory()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        $data = $this->request->getJSON(true);
        $category_id = $data['category_id'] ?? null;

        if (empty($data['category_name']) || !isset($data['description'])) {
            return $this->failValidationError('category_name and description are required.');
        }

        $categoryData = [
            'category_name' => $data['category_name'],
            'description'   => $data['description'],
            'modify_on'     => date('Y-m-d H:i:s'),
        ];

        if (empty($category_id)) {
            if ($this->categoryModel->categoryExists($data['category_name'])) {
                return $this->fail('Category with this category_name already exists.');
            }

            $categoryData['status']     = 1; // Active
            $categoryData['created_on'] = date('Y-m-d H:i:s');
            $categoryData['created_by'] = $user['user_id'];

            $this->categoryModel->addCategory($categoryData);

            return $this->respondCreated([
                'success' => true,
                'message' => 'Category created successfully.',
                'data'    => $categoryData
            ]);
        } else {
            if (!$this->categoryModel->categoryExists($category_id)) {
                return $this->failNotFound('Category not found.');
            }

            $categoryData['modify_by'] = $user['user_id'];
            $this->categoryModel->updateCategory($category_id, $categoryData);

            return $this->respond([
                'success' => true,
                'message' => 'Category updated successfully.',
                'data'    => array_merge(['category_id' => $category_id], $categoryData)
            ]);
        }
    }

    public function categorylist()
    {
        $pageIndex = (int) $this->request->getGet('pageIndex');
        $pageSize  = (int) $this->request->getGet('pageSize');
        $search    = $this->request->getGet('search');

        if ($pageSize <= 0) {
            $pageSize = 10;
        }

        $offset = $pageIndex * $pageSize;

        $builder = $this->categoryModel->where('status', 1); // Only active

        if (!empty($search)) {
            $builder->groupStart()
                    ->like('category_name', $search)
                    ->orLike('description', $search)
                    ->groupEnd();
        }

        $total = $builder->countAllResults(false);

        $categories = $builder
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
        $authHeader = $this->request->getHeaderLine('Authorization');
        $user = $this->authService->getAuthenticatedUser($authHeader);

        if (!$user) {
            return $this->failUnauthorized('Invalid or missing token.');
        }

        if (!$category_id || !$this->categoryModel->categoryExists($category_id)) {
            return $this->failNotFound('Category not found.');
        }

        // Soft delete
        $updateData = [
            'status'      => 9,
            'modify_on'   => date('Y-m-d H:i:s'),
            'modify_by' => $user['user_id']
        ];

        $this->categoryModel->updateCategory($category_id, $updateData);

        return $this->respondDeleted([
            'success' => true,
            'message' => 'Category marked as deleted successfully.'
        ]);
    }
}
