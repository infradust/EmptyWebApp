'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:dsCrane
 * @description
 * # dsCrane
 */
angular.module('testYoApp')
  .directive('dsCrane', function () {
    return {
      templateUrl: 'views/crane.html',
      restrict: 'E',
    };
  });
