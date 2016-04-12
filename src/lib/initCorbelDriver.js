'use strict'

var corbel = require('corbel-js')
var corbelDriverStore = require('./stores/corbelDriver.store')

function initCorbelDriver () {
  if (!this.config.credentials.clientId) {
    return Promise.reject('Missing config.credentials.clientId')
  }

  if (!this.config.credentials.clientSecret) {
    return Promise.reject('Missing config.credentials.clientSecret')
  }

  if (!this.config.credentials.scopes) {
    return Promise.reject('Missing config.credentials.scopes')
  }

  if (!this.config.urlBase) {
    return Promise.reject('Missing config.urlBase')
  }

  var module = this

  return new Promise(function (resolve, reject) {
    try {
      var options = {
        clientId: module.config.credentials.clientId,
        clientSecret: module.config.credentials.clientSecret,
        scopes: module.config.credentials.scopes,
        urlBase: module.config.urlBase
      }

      corbelDriverStore.setDriver(corbel.getDriver(options))

      resolve()
    } catch (e) {
      corbelDriverStore.setDriver(null)
      reject(e)
    }
  })
}

module.exports = initCorbelDriver
