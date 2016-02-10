'use strict';

function MockedResponse(serverType, res) {
  var module = this;
  this.res = res;
  this.serverType = serverType === 'express' ? 'express' : 'restify';

  this.cookies = {};
  this.statusCode = 200;
  this.promise = new Promise(function(resolve, reject) {
    module.resolve = function(response) {
      if (module.res) {
        module.respond(response);
      }
      resolve(response);
    };
    module.reject = function(response) {
      if (module.res) {
        module.respond(response);
      }
      reject(response);
    };
  });

  this._action = null;
}

MockedResponse.prototype.respond = function(response) {
  if (this.serverType === 'express') {
    this.expressResponse(response);
  } else {
    this.restifyResponse(response);
  }
};

MockedResponse.prototype.expressResponse = function(response) {
  this.res.status(response.status)[this._action](response.body);
};

MockedResponse.prototype.restifyResponse = function(response) {
  this.res.send(response.status, response.body);
};

MockedResponse.prototype.status = function(statusCode) {
  this.statusCode = parseInt(statusCode, 10);

  return this;
};

MockedResponse.prototype.cookie = function(name, value, options) {
  if (this.serverType === 'express'){
    if (this.res && typeof(this.res.cookie) === 'function') {
      this.res.cookie(name, value, options);
    }
  }else{
    if (this.res && typeof(this.res.setCookie) === 'function') {
      this.res.setCookie(name, value, options);
    }
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
      cookies: this.cookies
    });
  }

  return this.promise;
};

MockedResponse.prototype.json = function(data) {
  this._action = 'json';
  this.resolve({
    status: this.statusCode,
    body: data,
    cookies: this.cookies
  });
  return this.promise;
};

module.exports = function(serverType, res) {
  return new MockedResponse(serverType, res);
};