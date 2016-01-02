'use strict';

describe('Service: d3Symbols', function () {

  // load the service's module
  beforeEach(module('testYoApp'));

  // instantiate service
  var d3Symbols;
  beforeEach(inject(function (_d3Symbols_) {
    d3Symbols = _d3Symbols_;
  }));

  it('should do something', function () {
    expect(!!d3Symbols).toBe(true);
  });

});
