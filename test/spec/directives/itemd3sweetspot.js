'use strict';

describe('Directive: itemD3Sweetspot', function () {

  // load the directive's module
  beforeEach(module('testYoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<item-d3-sweetspot></item-d3-sweetspot>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the itemD3Sweetspot directive');
  }));
});
