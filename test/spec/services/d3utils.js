'use strict';

describe('Service: d3Utils', function () {

  // load the service's module
  beforeEach(module('testYoApp'));

  // instantiate service
  var d3Utils;
  beforeEach(inject(function (_d3Utils_) {
    d3Utils = _d3Utils_;
  }));

  it('should do something', function () {
    expect(!!d3Utils).toBe(true);
  });

});
