'use strict'

var driverStore = require('./stores/corbelDriver.store')

function clientLogin () {
  var module = this

  if (!driverStore.getDriver()) {
    module.events.emit('error', 'error:missing:corbelDriver')
    return Promise.reject('error:missing:corbelDriver')
  }

  return driverStore.getDriver().iam.token().create()
    .then(function (response) {
      if (response.data && response.data.accessToken) {
        module.events.emit('debug', 'login:successful')
        return response.data.accessToken
      } else {
        throw new Error('login:invalid:response')
      }
    })
    .catch(function (err) {
      // Invalid credentials, 401, 404
      var error = err && err.data && err.data ? err.data : err
      module.events.emit('error', err.message || 'login:invalid:credentials', err.status, error)
      throw error
    })
}

module.exports = clientLogin
