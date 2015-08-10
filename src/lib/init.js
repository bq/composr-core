'use strict';

var q = require('q');

function init(options) {
  /*jshint validthis:true */
  var dfd = q.defer();
  var module = this;

  this.config = this.bindConfiguration(options);

  //Do the stuff
  this.initCorbelDriver()
    .then(function() {
      return module.loginManager.clientLogin();
    })
    .then(function() {
      return module.fetchData();
    })
    .then(function() {
      return module.registerData();
    })
    .then(function() {
      module.events.emit('debug', 'success:initializing');
      dfd.resolve();
    })
    .catch(function(err) {
      //something failed, then reset the module to it's original state
      module.events.emit('error', 'error:initializing', err);
      module.reset();
      dfd.reject(err);
    });

  return dfd.promise;
}

module.exports = init;