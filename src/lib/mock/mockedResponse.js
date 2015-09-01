'use strict';

function MockedResponse() {
  this.statusCode = 200;
}

MockedResponse.prototype.status = function(statusCode) {
  this.statusCode = statusCode;

  return this;
};

MockedResponse.prototype.send = function(data) {
  return Promise.resolve({
    status: this.statusCode,
    body: data
  });
};

MockedResponse.prototype.json = function(data) {
  return Promise.resolve(data);
};

module.exports = function(options) {
  return new MockedResponse(options);
};