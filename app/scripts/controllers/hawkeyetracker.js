'use strict';

/**
 * @ngdoc function
 * @name testYoApp.controller:HawkeyetrackerCtrl
 * @description
 * # HawkeyetrackerCtrl
 * Controller of the testYoApp
 */
angular.module('testYoApp')
	.controller('HawkeyetrackerCtrl',['$scope', function ($scope) {
		$scope.hetDlg = this;
		var self = this;
	    var s;
	    var systems = this.systems = {};
	    
	    this.positionChanged = false;
	    
	    
	    function pressureHandler(system,component,msg) {
		    
	    }
	    function attitudeHandler(system,component,msg) {
		    
	    }
	    function positionHandler(system,component,msg) {
		    var tBoot = msg.time_boot_ms;
		    if (component.time_boot_ms === undefined || component.time_boot_ms < tBoot) {
			    component.time_boot_ms = tBoot;
			    system.lon = msg.lon/10000000;
			    system.lat = msg.lat/10000000;
			    system.alt = msg.alt;
			    if (self.redraw !== undefined) {
				    self.redraw();
			    }
		    } else {
			    console.log('system',system.key,'component',component.key,'stale data received: [',tBoot,',',component.time_boot_ms,']');
		    }
	    }
	    var msgHandler = {
		    29:pressureHandler,
		    30:attitudeHandler,
		    33:positionHandler,
	    }
		if (window.io !== undefined) {
			console.log('Socket.IO Found!');
		    s = $scope.socket = io.connect('http://localhost:9999');
		    s.on('connect',function(){
			    console.log('socket::connect');
		    });
		    
		    s.on('event',function(type,msgId,sys,comp,data){
			    //console.log('socket::event',type,msgId,comp,data);
			    var system = systems[''+sys];
			    if (system === undefined) {
				    system = {key:sys};
				    systems[''+sys] = system;
			    }
			    var component = system[''+comp];
			    if (component === undefined) {
				    component = {key:comp};
				    system[''+comp] = component;
			    }
			    var h = msgHandler[msgId];
			    if (h !== undefined) {
				    h(system,component,data);
			    }
		    });
		    
		    s.on('error',function(data){
			    console.log('socket::error',data);
		    });		
		}
		
		

	}]);
