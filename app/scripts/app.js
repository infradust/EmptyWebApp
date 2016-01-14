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
    'ngTouch',
  ])
  .config(['$stateProvider','$urlRouterProvider',function ($stateProvider,$urlRouterProvider) {
  	$urlRouterProvider.otherwise('/');
  	
  	$stateProvider
  		.state('home', {
	  		url:'/home',
	  		templateUrl:'views/main.html',
	  		controller:'MainCtrl',
	  		controllerAs:'main',
  		})
  		.state('user',{
	  		url:'/',
	  		templateUrl:'views/user.html',
	  		controller:'UserCtrl',
	  		controllerAs:'ctrl',	  		
  		})
  		.state('hawkeye',{
	  		url:'/hawkeyeTracker',
	  		templateUrl:'views/hawkeyetracker.html',
	  		controller:'HawkeyetrackerCtrl',
	  		controllerAs:'ctrl',
  		})
  		.state('proj',{
	  		url:'/proj',
	  		templateUrl:'views/proj.html',
	  		controller:'ProjCtrl',
	  		controllerAs:'ctrl',	  			  		
  		});
  }])
  .run(['$rootScope','$state','$stateParams',function($rootScope,$state,$stateParams){
	  $rootScope.$state = $state;
	  $rootScope.$stateParams = $stateParams;
  }])
  .controller('AppCtrl',['$scope','userService',function($scope,userService){
  	if (userService.loggedOn) {
	  	$scope.greeting = 'Hello ' + userService.user.name;
  	}
	  
  }])
  .directive('agLogo',[function(){
	  return {
		templateUrl:'views/logo.html',
		restrict: 'E',  
	  };
  }]);
