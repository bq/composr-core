'use strict';

function MockedRequest(options) {
  var module = this;

  if (!options) {
    options = {};
  }

  this.params = options.params || {};
  this.query = options.query || {};
  this.headers = options.headers || {};
  this.body = options.body || {};

  this.get = function(headerName) {
    return module.headers[headerName];
  };
}

module.exports = function(options) {
  return new MockedRequest(options);
};