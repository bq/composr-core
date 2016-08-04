'use strict'

var _ = require('lodash')
var DEFAULT_STATUS_CODE = 200

function MockedResponse (stream) {
  var module = this
  this.stream = stream
  this.cookies = {}
  this.headers = {}
  this.statusCode = DEFAULT_STATUS_CODE
}

MockedResponse.prototype.callbacks = {
  end: function() {}
}

MockedResponse.prototype.on = function(event, cb){
  this.callbacks[event] = cb
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
  this.cookies[name] = value

  return this
}

MockedResponse.prototype.setHeader = function (name, value) {
  if (this.res && typeof (this.res.header) === 'function') {
    this.res.header(name, value)
  }

  this.headers[name] = value

  return this
}

MockedResponse.prototype.setHeaders = function (headers) {
  this.headers = headers

  return this
}

MockedResponse.prototype.send = function (maybeCode, maybeBody) {
  var status = this.statusCode || 200
  var data

  if (typeof maybeCode === 'number') {
    status = maybeCode
    data = maybeBody
  } else {
    data = maybeCode
  }

  data = typeof (data) !== 'undefined' && data !== null ? data : ''

  this.statusCode = status

  var params = {
    statusCode: this.statusCode,
    body: data,
    headers: this.headers,
  }

  if (!params.headers['Content-Length'] && data.toString) {
    // Check if the object passed has the "toString" method, if not, don't use it
    this.setHeader('Content-Length', data.toString().length)
  }

  if (!(this.statusCode.toString().indexOf('4') === 0 || this.statusCode.toString().indexOf('5') === 0)) {
    params.cookies = this.cookies
  }

  if(this.stream){
    this.stream.pipe(params)
  }

  this.callbacks.end(params)
}

module.exports = function (res) {
  return new MockedResponse(res)
}
