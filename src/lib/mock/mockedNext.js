'use strict';

function MockedNext() {
  var module = this;

  this.promise = new Promise(function(resolve, reject) {
    module.resolve = resolve;
    module.reject = reject;
  });

  this.execute = function(data) {
    module.resolve(data);

    return module.promise;
  };
}

module.exports = function(options) {
  return new MockedNext(options);
};