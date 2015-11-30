'use strict';

function MockedRequest(serverType, req, options) {
  var module = this;

  this.serverType = serverType === 'express' ? 'express' : 'restify';

  if (!options) {
    options = {};
  }

  this.params = req ? req.params : options.params || {};
  this.query = req ? req.query : options.query || {};
  this.headers = req ? req.headers : options.headers || {};
  this.body = req ? req.body : options.body || {};

  this.get = function(headerName) {
    return module.headers[headerName];
  };
}

module.exports = function(serverType, req, options) {
  return new MockedRequest(serverType, req, options);
};