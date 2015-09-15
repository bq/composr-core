'use strict';

function MockedNext() {
  var module = this;

  this.promise = new Promise(function(resolve, reject) {
    module.resolve = resolve;
    module.reject = reject;
  });
}

MockedNext.prototype.execute = function(data) {
  this.resolve(data);

  return this.promise;
};

module.exports = function(options) {
  return new MockedNext(options);
};