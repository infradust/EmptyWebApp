'use strict';

describe('Service: demoData', function () {

  // load the service's module
  beforeEach(module('testYoApp'));

  // instantiate service
  var demoData;
  beforeEach(inject(function (_demoData_) {
    demoData = _demoData_;
  }));

  it('should do something', function () {
    expect(!!demoData).toBe(true);
  });

});
