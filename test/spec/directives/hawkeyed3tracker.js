'use strict';

describe('Directive: hawkeyeD3Tracker', function () {

  // load the directive's module
  beforeEach(module('testYoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<hawkeye-d3-tracker></hawkeye-d3-tracker>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the hawkeyeD3Tranker directive');
  }));
});
