<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('user/register', 'User::registerFun');
$routes->post('Login/login', 'Login::loginFun');
$routes->post('Login/login', 'Login::loginToken');

$routes->post('User/register','User::registerFun');
$routes->get('Category/categories', 'Category::categorylist');
$routes->post('Category/categories', 'Category::create');              
$routes->put('Category/categories/(:any)', 'Category::update/$1'); 
$routes->delete('Category/categories/(:any)', 'Category::delete/$1'); 

?>