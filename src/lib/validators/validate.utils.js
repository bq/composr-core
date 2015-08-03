'use strict';

var regexpGenerator = require('../regexpGenerator'),
  XRegExp = require('xregexp').XRegExp;
/**
 * Checks if some value is not undefined
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var isDefined = function(value) {
  var isUndefined = value === undefined;

  return !isUndefined;
};

/**
 * Checks if some value is defined and throw error
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var failIfIsDefined = function(value) {
  var isDefined = value !== undefined;

  return !isDefined;
};

/**
 * Checks whenever value are null or not
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var isNotNull = function(value) {
  var isNull = value === null;

  return !isNull;
};

/**
 * Checks whenever a value is not null and not undefined
 * @param  {Mixed}  value
 * @return {Boolean}
 */
var isValue = function(value) {
  return this.isDefined(value) && this.isNotNull(value);
};

/**
 * Checks whenever a value is greater than other
 * @param  {Mixed}  value
 * @param  {Mixed}  greaterThan
 * @return {Boolean}
 */
var isGreaterThan = function(value, greaterThan) {
  var gt = this.isValue(value) && value > greaterThan;

  return gt;
};

/**
 * Checks whenever a value is greater or equal than other
 * @param  {Mixed}  value
 * @param  {Mixed} isGreaterThanOrEqual
 * @return {Boolean}
 */
var isGreaterThanOrEqual = function(value, isGreaterThanOrEqual) {
  var gte = this.isValue(value) && value >= isGreaterThanOrEqual;

  return gte;
};

/**
 * Checks whenever a phrase url is well formed
 * @param  {String}  url
 * @return {XRegExp}
 */
var isValidUrl = function(url) {
  var regexp;
  try {
    var regexp = XRegExp(regexpGenerator.regexpUrl(url)); //jshint ignore : line
    XRegExp.test('test', regexp);
  } catch (e) {
    return false;
  }
  return regexp;
};

/**
 * Checks that is a valid base64
 * @param  {String}  codehash
 * @return {Boolean}
 */
var isValidBase64 = function(codehash) {
  var base64 = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;
  var isValid = base64.test(codehash);

  return isValid;
};

module.exports.isDefined = isDefined;
module.exports.failIfIsDefined = failIfIsDefined;
module.exports.isNotNull = isNotNull;
module.exports.isValue = isValue;
module.exports.isGreaterThan = isGreaterThan;
module.exports.isGreaterThanOrEqual = isGreaterThanOrEqual;
module.exports.isValidUrl = isValidUrl;
module.exports.isValidBase64 = isValidBase64;