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
  this.resolve({
    status: this.statusCode,
    body: data
  });
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