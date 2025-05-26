<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */



$routes->get('/', 'Home::index');

$routes->post('User/register','User::registerFun');
$routes->get('categories', 'Category::categorylist');
$routes->post('categories', 'Category::create');              
$routes->put('categories/(:any)', 'Category::update/$1'); 
$routes->delete('categories/(:any)', 'Category::delete/$1'); 

?>