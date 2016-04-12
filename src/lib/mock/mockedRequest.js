'use strict'

var capitalizeParam = function (param) {
  return param.split('-').map(function (item) {
    return item.charAt(0).toUpperCase() + item.slice(1)
  }).join('-')
}

function MockedRequest (serverType, req, options) {
  this.serverType = serverType === 'express' ? 'express' : 'restify'

  if (!options) {
    options = {}
  }

  this.params = options.params ? options.params : (req && req.params ? req.params : {})
  this.query = options.query ? options.query : (req && req.query ? req.query : {})
  this.headers = req && req.headers ? req.headers : options.headers || {}
  this.body = req ? req.body : options.body || {}

  if (this.headers && typeof (this.headers) === 'object') {
    this.capitalizeHeaders()
  }
}

MockedRequest.prototype.get = function (headerName) {
  headerName = capitalizeParam(headerName)
  return this.headers[headerName]
}

MockedRequest.prototype.capitalizeHeaders = function () {
  var newHeaders = {}
  var module = this

  Object.keys(this.headers).forEach(function (key) {
    var newKey = capitalizeParam(key)
    newHeaders[newKey] = module.headers[key]
  })

  this.headers = newHeaders
}

module.exports = function (serverType, req, options) {
  return new MockedRequest(serverType, req, options)
}
