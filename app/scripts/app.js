'use strict';

/**
 * @ngdoc overview
 * @name testYoApp
 * @description
 * # testYoApp
 *
 * Main module of the application.
 */
angular
  .module('testYoApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'ngTouch'
  ])
  .config(['$stateProvider','$urlRouterProvider',function ($stateProvider,$urlRouterProvider) {
  	$urlRouterProvider.otherwise('/');
  	
  	$stateProvider
  		.state('home', {
	  		url:'/',
	  		templateUrl:'views/main.html',
	  		controller:'MainCtrl',
	  		controllerAs:'main',
  		})
  		.state('about',{
	  		url:'/about',
	  		templateUrl:'views/about.html',
	  		controller:'AboutCtrl',
	  		controllerAs:'about',	  		
  		});
  }]);
