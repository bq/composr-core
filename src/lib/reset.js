'use strict';

var driverStore = require('./stores/corbelDriver.store');

function reset() {
  /*jshint validthis:true */
  this.config = null;

  //reset driver
  driverStore.setDriver(null);
}

module.exports = reset;