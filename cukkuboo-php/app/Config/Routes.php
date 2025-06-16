<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->post('Login/login', 'Login::loginFun',['filter' => 'cors']);
$routes->post('Login/logout', 'Login::logout');
$routes->post('Login/forgot-password', 'Login::sendOtp');
$routes->post('Login/reset-password', 'Login::resetPassword');


$routes->post('user/register','User::registerFun');
//$routes->get('user/profile', 'User::getUserDetails');
$routes->delete('user/delete/(:any)', 'User::deleteUser/$1');
$routes->get('user/profile/(:num)', 'User::getUserDetailsById/$1');
$routes->get('user/list', 'User::getUserList');
$routes->get('staff/list', 'User::getStaffList');





$routes->get('Genres/genres', 'Genres::genreList');
$routes->post('Genres/genres', 'Genres::create');              
$routes->post('Genres/genres/(:any)', 'Genres::update/$1');
$routes->delete('Genres/genres/(:any)', 'Genres::deleteGenere/$1');

$routes->get('category/categories', 'Category::categorylist');
$routes->post('category/categories', 'Category::saveCategory');               
$routes->delete('category/categories/(:any)', 'Category::delete/$1'); 

//video and image upload
$routes->post('upload-video', 'Uploads::uploadVideo');
$routes->post('upload-image', 'Uploads::uploadImage');

//movie details

$routes->post('movie/store', 'MovieDetail::store');
$routes->get('movie/moviedetails','MovieDetail::getAllMovieDetails');
$routes->get('getmovie/(:any)', 'MovieDetail::getMovieById/$1');
$routes->delete('movie/delete/(:any)','MovieDetail::deleteMovieDetails/$1');
$routes->get('movies/latest', 'MovieDetail::getLatestMovies');
$routes->get('movies/most-watched', 'MovieDetail::mostWatchedMovies');




//Home Display

$routes->get('api/home', 'MovieDetail::homeDisplay');


// Subscription Plan Routes 
$routes->get('subscriptionplan/list', 'SubscriptionPlan::getAll');           
$routes->get('subscriptionplan/get/(:num)', 'SubscriptionPlan::get/$1');     
$routes->post('subscriptionplan/save', 'SubscriptionPlan::savePlan');         
$routes->delete('subscriptionplan/delete/(:num)', 'SubscriptionPlan::delete/$1'); 

//reels details

$routes->post('reels/add', 'Reels::addReel');
$routes->get('reels/details', 'Reels::getAllReels');
$routes->get('reels/get/(:any)', 'Reels::getReelById/$1');
$routes->delete('reels/delete/(:any)', 'Reels::deleteReel/$1');

$routes->post('usersub/add', 'Usersub::saveSubscription');
$routes->get('usersub/details', 'Usersub::getAllSubscriptions');
$routes->get('usersub/get/(:num)', 'Usersub::getSubscriptionById/$1');
$routes->delete('usersub/delete/(:num)', 'Usersub::deleteSubscription/$1');


?>