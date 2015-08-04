'use strict';

var corbel = require('corbel-js');
var q = require('q');

function initCorbelDriver() {
  /*jshint validthis:true */

  if (!this.config.credentials.clientId) {
    return q.reject('Missing clientId');
  }

  if (!this.config.credentials.clientSecret) {
    return q.reject('Missing clientSecret');
  }

  if (!this.config.credentials.scopes) {
    return q.reject('Missing scopes');
  }

  var dfd = q.defer();

  try {
    this.corbelDriver = corbel.getDriver(this.config.credentials);
    dfd.resolve();
  } catch (e) {
    this.corbelDriver = null;
    dfd.reject(e);
  }

  return dfd.promise;
}

module.exports = initCorbelDriver;