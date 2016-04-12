'use strict'

var check = require('syntax-error')
var q = require('q')
var utils = require('../utils')
var semver = require('semver')
var vUtils = utils.values

function validate (snippet) {
  var dfd = q.defer()

  var errors = []

  var errorAccumulator = utils.errorAccumulator(errors)

  errorAccumulator(vUtils.isValue, snippet, 'undefined:snippet')
  errorAccumulator(vUtils.isValue, snippet.name, 'undefined:snippet:name')
  errorAccumulator(vUtils.isValue, snippet.version, 'undefined:snippet:version')
  errorAccumulator(semver.valid, snippet.version, 'incorrect:snippet:version')
  errorAccumulator(vUtils.isValue, snippet.codehash, 'undefined:snippet:codehash')

  // validate that id is well formed "domain!Name"
  if (!snippet.name) {
    errors.push('undefined:snippet:name')
  }

  var isValue = errorAccumulator(vUtils.isValue, snippet.codehash, 'undefined:snippet:codehash')
  var isValidBase64 = errorAccumulator(vUtils.isValidBase64, snippet.codehash, 'invalid:snippet:codehash')

  var code = ''

  if (isValue && isValidBase64) {
    code = new Buffer(snippet.codehash, 'base64').toString('utf8')
  }

  try {
    var funct = new Function('exports', code) // eslint-disable-line
    var error = check(funct)
    if (error) {
      errors.push('error:snippet:syntax')
    }
  } catch (e) {
    errors.push('error:snippet:syntax:' + e)
  }

  if (code.indexOf('exports(') === -1) {
    errors.push('error:missing:exports')
  }

  if (errors.length > 0) {
    dfd.reject(errors)
  } else {
    dfd.resolve(snippet)
  }

  return dfd.promise
}

module.exports = validate
