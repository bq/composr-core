'use strict'

var driverStore = require('./stores/corbelDriver.store')

function reset () {
  this.config = null

  // reset driver
  driverStore.setDriver(null)
}

module.exports = reset
