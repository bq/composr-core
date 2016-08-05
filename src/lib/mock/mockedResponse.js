'use strict'

var _ = require('lodash')
var DEFAULT_STATUS_CODE = 200

function MockedResponse (res) {
  this.res = res
  this.cookies = {}
  this.headers = {}
  this.finished = false
  this.statusCode = DEFAULT_STATUS_CODE
}

MockedResponse.prototype.callbacks = {
  end: function() {}
}

MockedResponse.prototype.on = function(event, cb){
  this.callbacks[event] = cb
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

  if (this.res && typeof (this.res.setCookie) === 'function') {
    this.res.setCookie(name, value, options)
  }

  return this
}

MockedResponse.prototype.setHeader = function (name, value) {
  if (this.res) {
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

  
  console.log('ENVIAMOS', status)

  if (data.toString) {
    // Check if the object passed has the "toString" method, if not, don't use it
    this.setHeader('Content-Length', data.toString().length)
  }

  this.finished = true

  if(this.res){
    this.res.send(status, data)
  }

  var params = {
    statusCode: status,
    body: data
  }

  this.callbacks.end(params)
}

module.exports = MockedResponse
