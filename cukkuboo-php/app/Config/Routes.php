<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('Login/login', 'Login::loginFun');
$routes->post('Login/logout', 'Login::logout');
$routes->post('Login/forgot-password', 'Login::sendOtp');
$routes->post('Login/reset-password', 'Login::resetPassword');


$routes->post('User/register','User::registerFun');
$routes->get('User/profile', 'User::getUserDetails');
$routes->put('User/update', 'User::updateUser');
$routes->delete('User/delete', 'User::deleteUser');


$routes->get('Genres/genres', 'Genres::genreList');
$routes->post('Genres/genres', 'Genres::create');              
$routes->post('Genres/genres/(:any)', 'Genres::update/$1');
$routes->delete('Genres/genres/(:any)', 'Genres::delete/$1');

$routes->get('Category/categories', 'Category::categorylist');
$routes->post('Category/categories', 'Category::create');              
$routes->post('Category/categories/(:any)', 'Category::update/$1'); 
$routes->delete('Category/categories/(:any)', 'Category::delete/$1'); 

?>