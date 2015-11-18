'use strict';

describe('Directive: dsCrane', function () {

  // load the directive's module
  beforeEach(module('testYoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ds-crane></ds-crane>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dsCrane directive');
  }));
});
