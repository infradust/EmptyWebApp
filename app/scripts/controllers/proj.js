'use strict';

/**
 * @ngdoc function
 * @name testYoApp.controller:ProjCtrl
 * @description
 * # ProjCtrl
 * Controller of the testYoApp
 */
angular.module('testYoApp')
  .controller('ProjCtrl', ['$scope','demoData',function ($scope,demoData) {
  	var self = this;
  	var bias = {travel:60,travelTime:60,placeAndRelease:-5*60};
	self.proj = $scope.proj = demoData.simulateProject(3,bias);	  
	$scope.visDlg = self;
	console.log('PROJ:',$scope.proj);
}]);
