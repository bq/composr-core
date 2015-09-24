'use strict';

function MockedResponse() {
  var module = this;
  this.statusCode = 200;
  this.promise = new Promise(function(resolve, reject) {
    module.resolve = resolve;
    module.reject = reject;
  });

  this._action = null;
}

MockedResponse.prototype.status = function(statusCode) {
  this.statusCode = statusCode;

  return this;
};

MockedResponse.prototype.send = function(data) {
  this._action = 'send';

  if (this.statusCode.toString().indexOf('4') === 0 || this.statusCode.toString().indexOf('5') === 0) {
    this.reject({
      status: this.statusCode,
      body: data,
    });
  } else {
    this.resolve({
      status: this.statusCode,
      body: data
    });
  }

  return this.promise;
};

MockedResponse.prototype.json = function(data) {
  this._action = 'json';
  this.resolve(data);
  return this.promise;
};

module.exports = function(options) {
  return new MockedResponse(options);
};