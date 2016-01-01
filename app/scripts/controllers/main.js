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
  .service('MainService',['demoData',function(demoData){
	var measurments = demoData.measurments;
	
	var listeners = {};
	var lid = 0;
	function emit(name,data) {
		var lst = listeners[name];
		if (lst !== undefined) {
			lst.forEach(function(d){d[1](name,data);});
		}		
	}
	
	function listen(name,callback) {
		var lst = listeners[name];
		if (lst === undefined) {
			lst = [];
			listeners[name] = lst;
		}
		lst.push([lid++,callback]);
		return lid-1;
	}
	
	function mute(name,id) {
		var lst = listeners[name];
		var foundAt = -1;
		for (var i = 0; i<lst.length || lst[i][0] > id; ++i) {
			if (lst[i][0] === id) {
				foundAt=i;
				break;
			}
		}
		if(foundAt !== -1) {
			lst.splice(foundAt,1);
		}
	}
	
	var ns = DS.namespace('cranes');	
	DS.makeClass({
		name:'CraneBaseTask',
		namespace:ns,
		cnst:function(crane,data){
			data = data || {};
			this._uonDone = data.onDone || angular.noop;
			this._uonStart = data.onStart || angular.noop;
			this.crane = crane;
			this.m = measurments[crane.__];
			this.deps = [];
			this.isDone = false;
			this.wasStarted = false
			this.onDone = angular.noop;
		},
		proto:function(p){
			p._start = function(){
				this.wasStarted = true;
				this._uonStart();
				this.start();
			};
			p.start = angular.noop;
			p.done = function () {
				this.isDone = true;
				this.onDone();
				this._uonDone();
			};
			p.action = function(dt){this.done();};
			p.step = function(dt) {
				if (this.isDone) {
					return;
				}
				if (!this.wasStarted) {
					this._start();
				}
				if (this.isDone) {
					return;
				}
				for (var i = 0; i < this.deps.length; ++i) {
					if ( !this.deps[i].isDone ) {
						this.deps[i].step(dt);
						return;
					}
				}
				this.action(dt);
			};
		},
	});
	
	DS.makeClass({
		name:'CraneTrolly',
		namespace:ns,
		base:ns.CraneBaseTask,
		cnst:function(crane,data){
			this.tPos = this.m.trolly_pos.latest.d;
			this.targetPos = data.targetTrolly || 0;
			this.velocity = data.trollyVelocity || 2;
		},
		proto:function(p){
			p.start = function (){
				if (this.tPos[0] > this.targetPos) {
					this.velocity *=-1;
				} else if (this.tPos[0] === this.targetPos) {
					this.done();
				}
			};
			p.action = function(dt){
				this.tPos[0] += (this.velocity*dt);
				if ( (this.velocity > 0 && this.tPos[0] > this.targetPos) ||
					 (this.velocity < 0 && this.tPos[0] < this.targetPos) ) {
					this.tPos[0] = this.targetPos;
					this.done();
				}
			};
		},
	});
	
	var dangerScale = d3.scale.quantize().domain([0, 1]).range(['OK','Boundry', 'Warning', 'Danger']);
	var dangerColorScale = d3.scale.quantize().domain([0, 1]).range(['green','yellow', 'orange', 'red']);
	
	DS.makeClass({
		name:'CraneLiftLower',
		namespace:ns,
		base:ns.CraneBaseTask,
		cnst:function(crane,data){
			this.height = this.m.hook_block_height.latest.d;
			this.load = this.m.load.latest.d;
			this.p = data.dropP || 0;
			this.targetHeight = data.targetHeight || 0;//[m]
			this.velocity = data.llVelocity || 1;//[m/sec]
			this.lifting = true;
			this.aTime = 0;
		},
		proto:function(p) {
			p.start = function() {
				if (this.p !== 0 && Math.random() < this.p && this.load[0] > 0) {
					this.dropTime = Math.random()*Math.abs(this.height[0]-this.targetHeight)/this.velocity;
				}
				if (this.height[0] > this.targetHeight) {
					this.lifting = false;
					this.velocity *= -1;
				} else if (this.height[0] === this.targetHeight) {
					this.done();
				}
			};
			p.action = function (dt){
				this.aTime += dt;
				if (this.dropTime && this.dropTime < this.aTime) {
					this.dropTime = undefined;
					var loss = (Math.random()*this.load[0]);
					this.load[0] -= loss;
					var self = this;
					emit('drop',{origin:self,crane:this.crane,loss:loss,current:this.load[0],type:this.m.load.latest.c});
				}
				this.height[0] += (this.velocity*dt);
				if ( (this.lifting && this.height[0] > this.targetHeight) ||
					(!this.lifting && this.height[0] < this.targetHeight) ) {
					this.height[0] = this.targetHeight;
					this.done();
				}
			};
		},
	});
	DS.makeClass({
		name:'CraneRotate',
		namespace:ns,
		base:ns.CraneBaseTask,
		cnst:function(crane,data){
			this.speed = this.m.slew_speed.latest.v;
			this.rotation = this.m.rotation.latest.r;
			this.targetRotation = data.targetRotation || 0;//[m]
			this.velocity = data.rVelocity || ((crane.max_slew_speed[0]/30)*Math.PI);//[rad/sec]
			var self = this;
			this.onDone = function(){self.speed[0] = 0;};
		},
		proto:function(p) {
			p.start = function () {
				if (this.rotation[0] > this.targetRotation) {
					this.velocity *= -1;
				} else if (this.rotation[0] === this.targetRotation) {
					this.done();
				}
				this.speed[0] = this.velocity;
			};
			p.action = function (dt){
				this.rotation[0] += (this.velocity*dt);
				if ( (this.velocity > 0 && this.rotation[0] > this.targetRotation) ||
					 (this.velocity < 0 && this.rotation[0] < this.targetRotation) ) {
					this.rotation[0] = this.targetRotation;
					this.done();
				}
			};
		},
	});
	
	DS.makeClass({
		name:'CraneDelay',
		namespace:ns,
		base:ns.CraneBaseTask,
		cnst:function(crane,data){
			this.type = data.type || '';
			this.time = data.time || 5;//[sec]
		},
		proto:function(p) {
			p.action = function (dt){
				this.time -= dt;
				if (this.time <= 0) {
					this.done();
				}
			};
		},
	});

	var loads = ['Plate','Cement','Iron','Sack'];
	
	DS.makeClass({
		name:'CraneMoveLoad',
		namespace:ns,
		base:ns.CraneBaseTask,
		cnst:function(crane,data){
			this.deps.push(new ns.CraneLiftLower(crane,{
				targetHeight:(crane.height[0]-10),
				llVelocity:3,
				onDone:function(){
					//console.log('initial lift done!');
				}
			}));
			this.deps.push(new ns.CraneTrolly(crane,{
				targetTrolly:Math.random()*crane.front_radius[0],
				onDone:function(){
					//console.log('trolly 1 done!');
				}
			}));
			this.deps.push(new ns.CraneRotate(crane,{
				targetRotation:2*Math.PI*Math.random(),
				onDone:function(){
					//console.log('rotating to source!');
				}
			}));
			this.deps.push(new ns.CraneLiftLower(crane,{
				targetHeight:0,
				llVelocity:3,
				onDone:function(){
					//console.log('lowering to source done!');
				}
			}));
			this.deps.push(new ns.CraneDelay(crane,{
				time:Math.random()*5,
				type:'',
				onDone:function(){
					this.m.load.latest.d[0] = Math.floor(Math.random()*this.crane.max_load[0]*1000);
					this.m.load.latest.c = loads[Math.floor(Math.random()*loads.length)];
					//console.log('loading done!');
				}
			}));
			this.deps.push(new ns.CraneLiftLower(crane,{
				targetHeight:(crane.height[0]-10),
				llVelocity:3,
				dropP:0.9,
				onDone:function(){
					//console.log('lifting load done!');
				}
			}));
			this.deps.push(new ns.CraneRotate(crane,{
				targetRotation:2*Math.PI*Math.random(),
				onDone:function(){
					//console.log('rotate to target done!');
				}
			}));
			this.deps.push(new ns.CraneTrolly(crane,{
				targetTrolly:Math.random()*crane.front_radius[0],
				onDone:function(){
					//console.log('trolly 2 done!');
				}
			}));
			this.deps.push(new ns.CraneLiftLower(crane,{
				targetHeight:0,
				llVelocity:3,
				dropP:0.9,
				onDone:function(){
					//console.log('lowering to target done!');
				}
			}));
			this.deps.push(new ns.CraneDelay(crane,{
				time:Math.random()*5,
				type:'',
				onDone:function(){
					this.m.load.latest.d[0] = 0;
					this.m.load.latest.c = undefined;
					//console.log('UNloading done!');
				}
			}));
		},
	});
	
	this.ns = ns;
	this.dangerScale = dangerScale;
	this.dangerColorScale = dangerColorScale;
	this.emit = emit;
	this.listen = listen;
	this.mute = mute;
	  
  }])
  .controller('MainCtrl', ['$scope','demoData','MainService',function ($scope,demoData,MS) {
  	var self = this;
	$scope.selected = undefined;
	$scope.ms = demoData.measurments;
	$scope.loadImages = {
		Plate:'images/scaffolding.jpeg',
		Cement:'images/cement-bucket.jpeg',
		Iron:'images/iron-grid.jpeg',
		Sack:'images/bulk-bag.jpeg',
	};

	$scope.crane_state_changed = 0;
	function dropDetected (name,data) {
		var crane = data.crane;
		crane.state = 1;
		$scope.crane_state_changed++;
		setTimeout(function(){crane.state = 0; $scope.crane_state_changed++;}, 6000);
	}
	MS.listen('drop',dropDetected);
	
    $scope.sideDlg= $scope.visDlg = this;
    $scope.spotDlg = this;
    this.$scope = $scope;
    var motionInfo = this.motionInfo = {};
    
	var inventory = demoData.inventory;
	var cranes = this.cranes = [inventory['crane_01'],inventory['crane_02'],inventory['crane_03'],inventory['crane_04'],inventory['crane_05']];
	var frame = this.frame = demoData.projects.p1.frame;
	var measurments = demoData.measurments;
	var project = this.project = demoData.projects.p1;	
		
	var tickCounter = 0;
	var craneTasks = {};
	this.cranesTick = function (dt) {
		for (var i = 0; i < cranes.length; ++i) {
			var key = cranes[i].__;
			var tsk = craneTasks[key];
			if (tsk === undefined || tsk.isDone) {
				tsk = new MS.ns.CraneMoveLoad(cranes[i]);
				craneTasks[key] = tsk;
			}
			tsk.step(dt);
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
	    
    this.select = function(d) {
		console.log('CTRL select:',d);
		$scope.selected = d;
		$scope.base_x = $scope.ms[d.__].base_location.latest.x;
		$scope.base_y = $scope.ms[d.__].base_location.latest.y;
		$scope.base_z = $scope.ms[d.__].base_location.latest.z;
		$scope.angle = $scope.ms[d.__].rotation.latest.r;
		$scope.hook_height = $scope.ms[d.__].hook_block_height.latest.d;
		$scope.crane_state = d.state;
		$scope.crane_load = $scope.ms[d.__].load.latest;
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
