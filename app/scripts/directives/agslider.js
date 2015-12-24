'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:agSlider
 * @description
 * # agSlider
 */
angular.module('testYoApp')
  .directive('agSlider', [function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      replace:true,
      scope:{slide:'='},
      link: function postLink(scope, element, attrs) {
	  	function report() {
		  	scope.slide(element.slider('value'));
	  	}
        element.slider({
        	min:0,
        	max:2*Math.PI,
        	step:0.001,
        	slide:report,
        	change:report,
        }
      );
    }
  };
}]);
