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
  	var self = this;
	$scope.selected = undefined;
	$scope.ms = demoData.measurments;
	
    $scope.sideDlg= $scope.visDlg = this;
    $scope.spotDlg = this;
    this.$scope = $scope;
    var motionInfo = this.motionInfo = {};
    
	var inventory = demoData.inventory;
	var cranes = this.cranes = [inventory['crane_01'],inventory['crane_02'],inventory['crane_03'],inventory['crane_04'],inventory['crane_05']];
	var frame = this.frame = demoData.projects.p1.frame;
	var measurments = demoData.measurments;
	var project = this.project = demoData.projects.p1;
	
	$scope.angleSliderOptions = {
		min:0,
		max:2*Math.PI,
		step:0.001,
		start:function(v){},
		stop:function(v){},
		orientation: 'horizontal',
		range:'min',
	};
	$scope.angleSliderValue = 0;

	function nextTD(d) {
		return function () {
			return Math.random()*d.front_radius[0];
		};
	}
		
	for (var i = 0; i < cranes.length; ++i) {
		var crane = cranes[i];
		var info = {
			v:0,
			av:1,
			td:0,
			tr:0,
			avr:(crane.max_slew_speed[0]/60)*2*Math.PI,
			nextTD:nextTD(crane),
			nextTR:function() {
	 			return Math.random()*2*Math.PI;
	 		},
		};
		motionInfo[crane.__] = info;
	}
	
	var tickCounter = 0;
	this.cranesTick = function (dt) {
		for (var i = 0; i < cranes.length; ++i) {
			var key = cranes[i]['__'];
			var info = motionInfo[key];
			var d = measurments[key].trolly_pos.latest.d;
			if (d[0] > cranes[i].front_radius[0]) {
				d[0] = cranes[i].front_radius[0];
				info.v = -info.av;
			} else if (d[0] < 0) {
				d[0] = 0;
				info.v = info.av;
			}
			if (d[0] > info.td) {
				if (info.v > 0) {
					info.td = info.nextTD();
			 	}
				info.v = -info.av;
			} else {
			 	if (info.v < 0) {
				 	info.td = info.nextTD();
			 	}
				info.v = info.av;
			}
			d[0] = d[0] + info.v*dt;
		
			d = measurments[key].rotation.latest.r;
			var m = measurments[key].slew_speed.latest;
			if (d[0] > info.tr) {
				if (m[0] > 0) {
			 		info.tr = info.nextTR();
				}
				m[0] = -info.avr;
			} else {
				if (m[0] < 0) {
			 		info.tr = info.nextTR();
				}
				m[0] = info.avr;
			}
			d[0] = d[0] + m[0]*dt;
		}
		
		self.cranesChanged = true;
		tickCounter++;
		if (tickCounter == 10) {
			tickCounter = 0;
		} else {
			return;
		}
		
		var t = this.sweetspotData.Speed;
		t.g += (Math.random()-0.5)*0.02;
		if (t.g > 1) {
			t.g = 1;
		} else if (t.g < 0) {
			t.g = 0;
		}
		var t = this.sweetspotData.Path;
		t.g += (Math.random()-0.5)*0.04;
		if (t.g > 1) {
			t.g = 1;
		} else if (t.g < 0) {
			t.g = 0;
		}
		var t = this.sweetspotData.Safety;
		t.g += (Math.random()-0.5)*0.01;
		if (t.g > 1) {
			t.g = 1;
		} else if (t.g < 0) {
			t.g = 0;
		}
	};

	this.cranesChanged = false;
	this.zRotation = 0;
	$scope.zAngleSlide = function(angle) {
		self.zRotation = angle;
	}
	    
    this.select = function(d) {
		console.log('CTRL select:',d);
		$scope.selected = d;
		$scope.base_x = $scope.ms[d['__']].base_location.latest.x;
		$scope.base_y = $scope.ms[d['__']].base_location.latest.y;
		$scope.base_z = $scope.ms[d['__']].base_location.latest.z;
		$scope.angle = $scope.ms[d['__']].rotation.latest.r;
		$scope.hook_height = $scope.ms[d['__']].hook_block_height.latest.d;
		this.sweetspotData.Speed.g = Math.random();
		this.sweetspotData.Path.g = Math.random();
		this.sweetspotData.Safety.g = Math.random();
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
    
    this.sweetspotData = {
    	'Speed':{g:0.1},
    	'Path':{g:0.5},
    	'Safety':{g:0.9},
    	_order:['Speed','Path','Safety'],
    };
    
  }]);
