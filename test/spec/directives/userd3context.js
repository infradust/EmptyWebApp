'use strict';

describe('Directive: userD3Context', function () {

  // load the directive's module
  beforeEach(module('testYoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<user-d3-context></user-d3-context>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the userD3Context directive');
  }));
});
