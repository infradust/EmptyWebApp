'use strict';

/**
 * @ngdoc service
 * @name testYoApp.userService
 * @description
 * # userService
 * Service in the testYoApp.
 */
angular.module('testYoApp')
  .service('userService',['demoData', function (demoData) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.loggedOn = true;
    this.user = {
	    name:'Demo1',
	    email:'demomail@axongo.com',
	    company:{'__':'vn',name:'Versitile Natures',logo:''},
	    projects:[demoData.projects.p1],
	    RACI:{R:{},A:{},C:{},I:{}}
    };
  }]);
