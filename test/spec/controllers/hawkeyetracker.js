'use strict';

describe('Controller: HawkeyetrackerCtrl', function () {

  // load the controller's module
  beforeEach(module('testYoApp'));

  var HawkeyetrackerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HawkeyetrackerCtrl = $controller('HawkeyetrackerCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(HawkeyetrackerCtrl.awesomeThings.length).toBe(3);
  });
});
