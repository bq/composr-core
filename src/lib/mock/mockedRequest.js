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

  if (this.headers && typeof(this.headers) === 'object') {
    this.capitalizeHeaders();
  }

  this.get = function(headerName) {
    return module.headers[headerName];
  };
}

MockedRequest.prototype.capitalizeHeaders = function() {
  var newHeaders = {};
  var module = this;

  Object.keys(this.headers).forEach(function(key) {
    var newKey = key.split('-').map(function(item) {
      return item.charAt(0).toUpperCase() + item.slice(1);
    }).join('-');
    newHeaders[newKey] = module.headers[key];
  });

  this.headers = newHeaders;
};

module.exports = function(serverType, req, options) {
  return new MockedRequest(serverType, req, options);
};
