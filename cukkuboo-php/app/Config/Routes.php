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
$routes->post('user/change-password', 'User::changePassword');
//User 

$routes->post('user/register','User::registerFun');
$routes->post('user/delete/(:any)', 'User::deleteUser/$1');
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
$routes->post('movie/movieReaction/(:num)', 'MovieDetail::movieReaction/$1');

//Admin Home Display

$routes->get('movies/dashboard', 'MovieDetail::getAdminDashBoardData');
$routes->get('movies/latestmovies', 'MovieDetail::latestMovies');
$routes->get('movies/mostwatchmovie', 'MovieDetail::getMostWatchMovies');
$routes->delete('user/delete/(:any)', 'User::deleteUserById/$1');
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
$routes->post('usersub/save', 'Usersub::autoSubscribe');
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
$routes->get('notification/get/(:num)', 'Notification::getNotificationById/$1');
$routes->get('notification/get', 'Notification::getUserNotifications');

// Watched history

$routes->post('resume/saveprogress', 'Resume::saveProgress');
$routes->get('resume/viewhistory', 'Resume::getAllHistory');
$routes->get('resume/view/(:num)', 'Resume::getById/$1');
$routes->get('resume/user', 'Resume::getUserHistory');
$routes->delete('resume/delete/(:num)', 'Resume::deleteById/$1');
//Save Completed History

$routes->post('savehistory/save', 'Savehistory::saveMovie');
$routes->get('savehistory/history', 'Savehistory::getHistory');
$routes->get('savehistory/view/(:num)', 'Savehistory::getById/$1');
$routes->delete('savehistory/delete/(:num)', 'Savehistory::deleteHistory/$1');
$routes->get('savehistory/user', 'Savehistory::getUserHistory');
$routes->delete('savehistory/clear-all', 'Savehistory::clearAllHistory');
//Video view count

$routes->post('video/videoview', 'VideoView::viewVideo');
 //Watch Later
$routes->post('watch/save', 'WatchLater::add');
$routes->get('watch/list', 'WatchLater::getlist');
$routes->get('watch/get/(:num)', 'WatchLater::getById/$1');
$routes->get('watch/user', 'WatchLater::getUserWatchLater');
$routes->delete('watch/delete/(:num)', 'WatchLater::delete/$1');
$routes->delete('watch/clear-all', 'WatchLater::clearAllHistory');

?>