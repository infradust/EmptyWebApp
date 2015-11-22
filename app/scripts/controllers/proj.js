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
  	var bias = {travel:60,travelTime:2*60,placeAndRelease:5*60};
	self.proj = $scope.proj = demoData.simulateProject(7,bias);	  
	$scope.visDlg = self;
	$scope.day = 0;
	self.$scope=$scope;
	console.log('PROJ:',$scope.proj);
	
	$scope.changeDay = function () {
		$scope.day++;
		if ($scope.day > $scope.proj.days.length-1) {
			$scope.day = 0;	
		}
	};
}]);
