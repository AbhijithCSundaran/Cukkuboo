<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('Login/login', 'Login::loginFun');
$routes->post('Login/logout', 'Login::logout');


$routes->post('User/register','User::registerFun');
$routes->get('User/profile', 'User::getUserDetails');
$routes->put('User/update', 'User::updateUser');
$routes->delete('User/delete', 'User::deleteUser');

$routes->get('Category/categories', 'Category::categorylist');
$routes->post('Category/categories', 'Category::create');              
$routes->post('Category/categories/(:any)', 'Category::update/$1'); 
$routes->delete('Category/categories/(:any)', 'Category::delete/$1'); 

?>