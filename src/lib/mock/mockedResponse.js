'use strict'

var _ = require('lodash')
var DEFAULT_STATUS_CODE = 200

function MockedResponse (serverType, res) {
  var module = this
  this.res = res
  this.sent = false
  this.serverType = serverType === 'express' ? 'express' : 'restify'

  this.cookies = {}
  this.headers = {}
  this.statusCode = DEFAULT_STATUS_CODE
  this.promise = new Promise(function (resolve, reject) {
    module.resolve = function (response) {
      if (module.res) {
        module.respond(response)
      }
      resolve(response)
    }
    module.reject = function (response) {
      if (module.res) {
        module.respond(response)
      }
      reject(response)
    }
  })

  this._action = null
}

MockedResponse.prototype.hasEnded = function () {
  return this.sent
}

MockedResponse.prototype.respond = function (response) {
  this.sent = true
  if (this.serverType === 'express') {
    this.expressResponse(response)
  } else {
    this.restifyResponse(response)
  }
}

MockedResponse.prototype.expressResponse = function (response) {
  this.res.headers = response.headers
  this.res.status(response.status)[this._action](response.body)
}

MockedResponse.prototype.restifyResponse = function (response) {
  this.res.headers = response.headers
  this.res.send(response.status, response.body)
}

MockedResponse.prototype.status = function (statusCode) {
  this.statusCode = parseInt(statusCode, 10)

  if (!_.isInteger(this.statusCode)) {
    this.statusCode = DEFAULT_STATUS_CODE
  }

  return this
}

MockedResponse.prototype.cookie = function (name, value, options) {
  if (this.serverType === 'express') {
    if (this.res && typeof (this.res.cookie) === 'function') {
      this.res.cookie(name, value, options)
    }
  } else {
    if (this.res && typeof (this.res.setCookie) === 'function') {
      this.res.setCookie(name, value, options)
    }
  }

  this.cookies[name] = value

  return this
}

MockedResponse.prototype.setHeader = function (name, value) {
  if (this.serverType === 'express') {
    if (this.res && typeof (this.res.set) === 'function') {
      this.res.set(name, value)
    }
  } else {
    if (this.res && typeof (this.res.header) === 'function') {
      this.res.header(name, value)
    }
  }

  this.headers[name] = value

  return this
}

MockedResponse.prototype.setHeaders = function (headers) {
  if (this.serverType === 'express') {
    if (this.res && typeof (this.res.set) === 'function') {
      this.res.set(headers)
    }
  } else {
    if (this.res && typeof (this.res.header) === 'function') {
      var that = this
      _.forIn(headers, function (value, key) {
        that.res.header(key, value)
      })
    }
  }

  this.headers = headers

  return this
}

MockedResponse.prototype.send = function (status, data) {
  this._action = 'send'
  data = typeof (data) !== 'undefined' && data !== null ? data : ''

  this.statusCode = status
  
  var params = {
    status: this.statusCode,
    body: data,
    headers: this.headers
  }

  if (!params.headers['Content-Length'] && data.toString) {
    // Check if the object passed has the "toString" method, if not, don't use it
    this.setHeader('Content-Length', data.toString().length)
  }

  if (this.statusCode.toString().indexOf('4') === 0 || this.statusCode.toString().indexOf('5') === 0) {
    this.reject(params)
  } else {
    params.cookies = this.cookies
    this.resolve(params)
  }

  return this.promise
}

MockedResponse.prototype.json = function (data) {
  this._action = 'json'
  data = typeof (data) !== 'undefined' && data !== null ? data : ''
  var params = {
    status: this.statusCode,
    body: data,
    headers: this.headers,
    cookies: this.cookies
  }

  if (!params.headers['Content-Length']) {
    this.setHeader('Content-Length', data.toString().length)
  }

  this.resolve(params)
  return this.promise
}

module.exports = function (serverType, res) {
  return new MockedResponse(serverType, res)
}
