'use strict';

describe('Service: AGMath', function () {

  // load the service's module
  beforeEach(module('testYoApp'));

  // instantiate service
  var AGMath;
  beforeEach(inject(function (_AGMath_) {
    AGMath = _AGMath_;
  }));

  it('should do something', function () {
    expect(!!AGMath).toBe(true);
  });

});
