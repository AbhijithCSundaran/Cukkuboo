<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('user/register', 'User::registerFun');
$routes->post('user/login', 'User::login');

$routes->post('user/logout', 'User::logout');

$routes->get('genres', 'Genres::getAllGenres');
$routes->post('genres', 'Genres::create');             
$routes->put('genres/(:segment)', 'Genres::update/$1'); 
$routes->delete('genres/(:segment)', 'Genres::delete/$1'); 

?>