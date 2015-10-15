'use strict';

function MockedResponse(originalRes) {
  var module = this;
  this.originalRes = originalRes;
  this.cookies = {};
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

MockedResponse.prototype.cookie = function(name, value, options) {
  if (this.originalRes && typeof(this.originalRes.cookie) === 'function') {
    this.originalRes.cookie(name, value, options);
  }
  
  this.cookies[name] = value;

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
      body: data,
      cookies : this.cookies
    });
  }

  return this.promise;
};

MockedResponse.prototype.json = function(data) {
  this._action = 'json';
  this.resolve({
    status: this.statusCode,
    body: data,
    cookies : this.cookies
  });
  return this.promise;
};

module.exports = function(originalRes) {
  return new MockedResponse(originalRes);
};