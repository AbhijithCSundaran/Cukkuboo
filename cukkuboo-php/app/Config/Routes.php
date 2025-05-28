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
$routes->post('User/update', 'User::updateUser');
$routes->delete('User/delete', 'User::deleteUser');
$routes->get('User/profile/(:num)', 'User::getUserDetailsById/$1');
$routes->post('User/update/(:num)', 'User::updateUserById/$1');
$routes->delete('User/delete/(:num)', 'User::deleteUserById/$1');



$routes->get('Genres/genres', 'Genres::genreList');
$routes->post('Genres/genres', 'Genres::create');              
$routes->post('Genres/genres/(:any)', 'Genres::update/$1');
$routes->delete('Genres/genres/(:any)', 'Genres::delete/$1');

$routes->get('Category/categories', 'Category::categorylist');
$routes->post('Category/categories', 'Category::create');              
$routes->post('Category/categories/(:any)', 'Category::update/$1'); 
$routes->delete('Category/categories/(:any)', 'Category::delete/$1'); 

?>