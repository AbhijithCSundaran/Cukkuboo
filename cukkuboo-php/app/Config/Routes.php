<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('Login/login', 'Login::loginFun',['filter' => 'cors']);
$routes->post('Login/logout', 'Login::logout');


$routes->post('user/register','User::registerFun');
$routes->get('user/profile', 'User::getUserDetails');
$routes->delete('user/delete', 'User::deleteUser');
$routes->get('user/profile/(:num)', 'User::getUserDetailsById/$1');
$routes->get('user/list', 'User::getUserList');





$routes->get('Genres/genres', 'Genres::genreList');
$routes->post('Genres/genres', 'Genres::create');              
$routes->post('Genres/genres/(:any)', 'Genres::update/$1');
$routes->delete('Genres/genres/(:any)', 'Genres::delete/$1');

$routes->get('category/categories', 'Category::categorylist');
$routes->post('category/categories', 'Category::saveCategory');               
$routes->delete('category/categories/(:any)', 'Category::delete/$1'); 

//video and image upload
$routes->post('upload-video', 'Uploads::uploadVideo');
$routes->post('upload-image', 'Uploads::uploadImage');

//movie details

$routes->post('movie/store', 'MovieDetail::store');
$routes->get('get/moviedetails','MovieDetail::getAllMovieDetails');
$routes->get('getmovie/(:any)', 'MovieDetail::getMovieById/$1');
$routes->post('movie/delete/(:any)','MovieDetail::deleteMovieDetails/$1');


//Home Display

$routes->get('api/home', 'MovieDetail::homeDisplay');


    // Subscription Plan Routes 
$routes->get('subscriptionplan/list', 'SubscriptionPlan::getAll');           
$routes->get('subscriptionplan/get/(:num)', 'SubscriptionPlan::get/$1');     
$routes->post('subscriptionplan/save', 'SubscriptionPlan::savePlan');         
$routes->delete('subscriptionplan/delete/(:num)', 'SubscriptionPlan::delete/$1'); 



?>