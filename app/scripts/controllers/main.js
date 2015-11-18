'use strict';

/**
 * @ngdoc function
 * @name testYoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testYoApp
 */
angular.module('testYoApp')
  .filter('radToDeg',function(){return function(rad){return rad*180/Math.PI;};})
  .filter('fixed2',function() {return function(n){ return n.toFixed(2);};})
  .controller('MainCtrl', ['$scope','demoData',function ($scope,demoData) {
	$scope.selected = undefined;
	$scope.ms = demoData.measurments;
	
    $scope.visDlg = this;
    this.$scope = $scope;
    this.select = function(d) {
		console.log('CTRL select:',d);
		$scope.selected = d;
		$scope.base_x = $scope.ms[d['__']].base_location.latest.x;
		$scope.base_y = $scope.ms[d['__']].base_location.latest.y;
		$scope.base_z = $scope.ms[d['__']].base_location.latest.z;
		$scope.angle = $scope.ms[d['__']].rotation.latest.r;
		$scope.hook_height = $scope.ms[d['__']].hook_block_height.latest.d;
    };
    this.unselect = function(d) {
    	console.log('CTRL unselect:',d);
    	$scope.selected = undefined;
    };
    
    $scope.showRadaii = false;
    
    $scope.toggleRadii = function () {
	  	$scope.showRadii = !$scope.showRadii;  
    };
    
    $scope.showBrake = false;
    $scope.toggleBrake = function () {
		$scope.showBrake = !$scope.showBrake;	    
    };
    
  }]);
