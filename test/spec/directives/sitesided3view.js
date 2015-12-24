'use strict';

describe('Directive: siteSideD3View', function () {

  // load the directive's module
  beforeEach(module('testYoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<site-side-d3-view></site-side-d3-view>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the siteSideD3View directive');
  }));
});
