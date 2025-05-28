<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('user/register', 'User::registerFun');
$routes->post('Login/login', 'Login::loginFun');
$routes->post('Login/logout', 'Login::logout');


$routes->post('User/register','User::registerFun');
$routes->get('Genres/genres', 'Genres::genreList');
$routes->post('Genres/genres', 'Genres::create');              
$routes->post('Genres/genres/(:any)', 'Genres::update/$1');
$routes->delete('Genres/genres/(:any)', 'Genres::delete/$1');

?>