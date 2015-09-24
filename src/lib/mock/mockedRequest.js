'use strict';

function MockedRequest(options) {

  if (!options) {
    options = {};
  }

  this.params = options.params || {};
  this.query = options.query || {};
  this.headers = options.headers || {};
  this.body = options.body || {};
}

MockedRequest.prototype.get = function(headerName) {
  return this.headers[headerName];
};

module.exports = function(options) {
  return new MockedRequest(options);
};