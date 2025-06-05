<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('Login/login', 'Login::loginFun',['filter' => 'cors']);
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

//video and image upload
$routes->post('upload-video', 'Uploads::uploadVideo');
$routes->post('upload-image', 'Uploads::uploadImage');

//movie details

$routes->post('movie/store', 'MovieDetail::store');
$routes->get('get/moviedetails','MovieDetail::getAllMovieDetails');
$routes->get('getmovie/(:any)', 'MovieDetail::getMovieById/$1');
$routes->post('movie/delete','MovieDetail::deleteMovieDetails');


//Home Display

$routes->get('api/home', 'MovieDetail::homeDisplay');


    // Subscription Plan Routes 
$routes->get('subscriptionplan/list', 'SubscriptionPlan::getAll');           
$routes->get('subscriptionplan/get/(:num)', 'SubscriptionPlan::get/$1');     
$routes->post('subscriptionplan/create', 'SubscriptionPlan::create');        
$routes->post('subscriptionplan/update/(:num)', 'SubscriptionPlan::edit/$1'); 
$routes->delete('subscriptionplan/delete/(:num)', 'SubscriptionPlan::delete/$1'); 



?>