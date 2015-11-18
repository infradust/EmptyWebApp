'use strict';

describe('Controller: ProjCtrl', function () {

  // load the controller's module
  beforeEach(module('testYoApp'));

  var ProjCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjCtrl = $controller('ProjCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProjCtrl.awesomeThings.length).toBe(3);
  });
});
