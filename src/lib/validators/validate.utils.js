'use strict'

var regexpGenerator = require('../regexpGenerator')
var XRegExp = require('xregexp')
/**
 * Checks if some value is not undefined
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var isDefined = function (value) {
  var isUndefined = value === undefined

  return !isUndefined
}

/**
 * Checks whenever value are null or not
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var isNotNull = function isNotNull (value) {
  var isNull = value === null

  return !isNull
}

/**
 * Checks whenever a value is not null and not undefined
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var isValue = function isValue (value) {
  return isDefined(value) && isNotNull(value)
}

/**
 * Checks whenever a value is a falsy value
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var isFalsy = function isFalsy (value) {
  return !value
}

/**
 * Checks whenever a value is greater than other
 * @param  {Mixed}  value
 * @param  {Mixed}  greaterThan
 * @return {Boolean}
 */
var isGreaterThan = function (value, greaterThan) {
  var gt = isValue(value) && value > greaterThan

  return gt
}

/**
 * Checks whenever a value is greater or equal than other
 * @param  {Mixed}  value
 * @param  {Mixed} isGreaterThanOrEqual
 * @return {Boolean}
 */
var isGreaterThanOrEqual = function (value, isGreaterThanOrEqual) {
  var gte = isValue(value) && value >= isGreaterThanOrEqual

  return gte
}

/**
 * Checks whenever a phrase url is well formed
 * @param  {String}  url
 * @return {XRegExp}
 */
var isValidEndpoint = function (url) {
  try {
    // Try to generate the regular expression that extract the pathParams, and randomly execute it
    var regexp = XRegExp(regexpGenerator.regexpUrl(url))
    // if it throws an error then the regular expression that was formed was invalid and it's not a composr compilant endpoint
    XRegExp.test('test', regexp)

    // Now try to ensure that the url is well formed
    var regexpUrlString = '^\/?([\\w-._:?#@]+\/?)+'
    var xregexpUrl = XRegExp(regexpUrlString)

    return XRegExp.test(url, xregexpUrl)
  } catch (e) {
    return false
  }
  return true
}

/**
 * Checks that is a valid base64
 * @param  {String}  codehash
 * @return {Boolean}
 */
var isValidBase64 = function (codehash) {
  var base64 = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i
  var isValid = base64.test(codehash)

  return isValid && isValue(codehash)
}

module.exports.isDefined = isDefined
module.exports.isNotNull = isNotNull
module.exports.isValue = isValue
module.exports.isFalsy = isFalsy
module.exports.isGreaterThan = isGreaterThan
module.exports.isGreaterThanOrEqual = isGreaterThanOrEqual
module.exports.isValidEndpoint = isValidEndpoint
module.exports.isValidBase64 = isValidBase64
