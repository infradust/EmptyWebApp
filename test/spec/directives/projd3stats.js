'use strict';

describe('Directive: projD3Stats', function () {

  // load the directive's module
  beforeEach(module('testYoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<proj-d3-stats></proj-d3-stats>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the projD3Stats directive');
  }));
});