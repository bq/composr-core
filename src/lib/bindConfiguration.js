'use strict'

var _ = require('lodash')

function bindConfiguration (options) {
  // TODO: read from .composrrc from project root
  options = options || {}

  var config = {
    timeout: 10000,
    credentials: {
      clientId: '',
      clientSecret: '',
      scopes: ''
    },
    urlBase: ''
  }

  return _.defaults(options, config)
}

module.exports = bindConfiguration
