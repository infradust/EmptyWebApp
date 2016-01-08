'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:projectMessages
 * @description
 * # projectMessages
 */
angular.module('testYoApp')
  .directive('projectMessages', function () {
    return {
      template: '<div class="projectMessageBox">\
      				<ul class="list-group prj_msgbox">\
      					<li class="list-group-item list-group-item-danger prj_msg" ng-repeat="m in msgs">{{m.msg}}</li>\
      				<ul/>\
	  			</div>',
      restrict: 'E',
      scope:{msgs:'='},

      link: function postLink(scope, element, attrs) {
        scope.$watchCollection('msgs',function(){
			$(element).scrollTop($(element)[0].scrollHeight);	        
        });
      },

    };
  });
