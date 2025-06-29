<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

//Login

$routes->post('login/login', 'Login::loginFun',['filter' => 'cors']);
$routes->post('login/logout', 'Login::logout');
$routes->post('login/forgot-password', 'Login::sendOtp');
$routes->post('login/reset-password', 'Login::resetPassword');

//User 

$routes->post('user/register','User::registerFun');
$routes->delete('user/delete/(:any)', 'User::deleteUser/$1');
$routes->get('user/profile/(:num)', 'User::getUserDetailsById/$1');
$routes->get('user/profile', 'User::getUserDetailsById');
$routes->get('user/list', 'User::getUserList');
$routes->get('staff/list', 'User::getStaffList');
$routes->post('user/email-preference', 'User::updateEmailPreference');

//Category

$routes->get('category/categories', 'Category::categorylist');
$routes->get('category/categories/(:num)', 'Category::getCategoryById/$1');
$routes->post('category/categories', 'Category::saveCategory');               
$routes->delete('category/categories/(:any)', 'Category::delete/$1'); 

//Video and image upload

$routes->post('upload-video', 'Uploads::uploadVideo');
$routes->post('upload-image', 'Uploads::uploadImage');

//Movie details

$routes->post('movie/store', 'MovieDetail::store');
$routes->get('movie/moviedetails','MovieDetail::getAllMovieDetails');
$routes->get('getmovie/(:any)', 'MovieDetail::getMovieById/$1');
$routes->delete('movie/delete/(:any)','MovieDetail::deleteMovieDetails/$1');
$routes->get('movies/latest', 'MovieDetail::getLatestMovies');
$routes->get('movies/most-watched', 'MovieDetail::mostWatchedMovies');

//Admin Home Display

$routes->get('movies/dashboard', 'MovieDetail::getAdminDashBoardData');
$routes->get('movies/latestmovies', 'MovieDetail::latestMovies');
$routes->get('movies/mostwatchmovie', 'MovieDetail::getMostWatchMovies');
// $routes->get('user/count-user', 'User::countActiveUsers');
// $routes->get('user/subscriber', 'SubscriptionPlan::countSubscribers');
// $routes->get('movies/countActive', 'MovieDetail::countActiveMovies');
// $routes->get('movies/countInActive', 'MovieDetail::countInactiveMovie');
$routes->get('movies/related/(:num)', 'MovieDetail::getRelatedMovies/$1');


//Home Display

$routes->get('movies/userDashboard', 'MovieDetail::getUserHomeData');
$routes->get('api/home', 'MovieDetail::homeDisplay');


// Subscription Plan Routes 

$routes->post('subscriptionplan/save', 'SubscriptionPlan::savePlan');    
$routes->get('subscriptionplan/list', 'SubscriptionPlan::getAll');           
$routes->get('subscriptionplan/get/(:num)', 'SubscriptionPlan::get/$1');          
$routes->delete('subscriptionplan/delete/(:num)', 'SubscriptionPlan::delete/$1'); 

//Reels details

$routes->post('reels/add', 'Reels::addReel');
$routes->get('reels/details', 'Reels::getAllReels');
$routes->get('reels/get/(:any)', 'Reels::getReelById/$1');
$routes->delete('reels/delete/(:any)', 'Reels::deleteReel/$1');

//User subscription

$routes->post('usersub/add', 'Usersub::saveSubscription');
$routes->get('usersub/details', 'Usersub::getUserSubscriptions');
$routes->get('usersub/get/(:num)', 'Usersub::getSubscriptionById/$1');
$routes->delete('usersub/delete/(:num)', 'Usersub::deleteSubscription/$1');

//Reels like and views

$routes->post('reellike/like', 'ReelLike::reelLike');
$routes->post('reelview/view', 'ReelView::viewReel');

//Notifications

$routes->post('notification/save', 'Notification::createOrUpdate'); 
$routes->get('notification/list', 'Notification::getAllNotifications');          
$routes->delete('notification/delete/(:num)', 'Notification::delete/$1'); 
$routes->post('notification/markall', 'Notification::markAllAsReadOrUnread'); 
$routes->get('notification/get/(:num)', 'Notification::getUserNotifications/$1');
$routes->get('notification/get', 'Notification::getUserNotifications');

// Watched history

$routes->post('resume/saveprogress', 'Resume::saveProgress');
$routes->get('resume/viewhistory', 'Resume::viewHistory');

//Save Completed History

$routes->post('savehistory/save', 'Savehistory::saveMovie');
$routes->get('savehistory/history', 'Savehistory::saveHistory');

//Video view count

$routes->post('video/videoview', 'VideoView::viewVideo');


?>