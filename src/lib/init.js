'use strict';

var q = require('q');

function init(options) {
  /*jshint validthis:true */
  var dfd = q.defer();
  var module = this;

  this.config = this.bindConfiguration(options);

  this.requirer.configure(this.config);
  //Do the stuff
  this.initCorbelDriver()
    .then(function() {
      return module.clientLogin();
    })
    .then(function(token) {
      module.data.token = token;
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
      //TODO: emit('error') causes an unhandled execption in node.
      module.events.emit('errore', 'error:initializing', err);
      module.reset();
      dfd.reject(err);
    });

  return dfd.promise;
}

module.exports = init;