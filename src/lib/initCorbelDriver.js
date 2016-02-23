'use strict';

var corbel = require('corbel-js');
var q = require('q');
var corbelDriverStore = require('./stores/corbelDriver.store');

function initCorbelDriver() {
  /*jshint validthis:true */

  if (!this.config.credentials.clientId) {
    return q.reject('Missing config.credentials.clientId');
  }

  if (!this.config.credentials.clientSecret) {
    return q.reject('Missing config.credentials.clientSecret');
  }

  if (!this.config.credentials.scopes) {
    return q.reject('Missing config.credentials.scopes');
  }

  if (!this.config.urlBase) {
    return q.reject('Missing config.urlBase');
  }

  var dfd = q.defer();

  try {
    var options = {
      clientId : this.config.credentials.clientId,
      clientSecret : this.config.credentials.clientSecret,
      scopes : this.config.credentials.scopes,
      urlBase : this.config.urlBase
    };
    
    corbelDriverStore.setDriver(corbel.getDriver(options));

    dfd.resolve();
  } catch (e) {
    corbelDriverStore.setDriver(null);
    dfd.reject(e);
  }

  return dfd.promise;
}

module.exports = initCorbelDriver;