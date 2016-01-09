'use strict';

describe('Directive: d3KPI', function () {

  // load the directive's module
  beforeEach(module('testYoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<d3-k-p-i></d3-k-p-i>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the d3KPI directive');
  }));
});