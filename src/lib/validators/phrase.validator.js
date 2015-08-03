'use strict';

var check = require('syntax-error'),
  vUtils = require('./validate.utils');


function validationErrorsAcc(errors) {
  return function(validation, field, err) {
    var ok = validation(field);
    if (!ok) {
      errors.push(err);
    }
    return ok;
  };
}


function validate(phrase) {
  var errors = [];

  var errorAccumulator = validationErrorsAcc(errors);

  errorAccumulator(vUtils.isValue, phrase, 'undefined:phrase');
  errorAccumulator(vUtils.isValue, phrase.url, 'undefined:phrase:url');
  errorAccumulator(vUtils.isValidEndpoint, phrase.url, 'error:phrase:url:syntax');

  var methodPresent = false;

  ['get', 'post', 'put', 'delete', 'options'].forEach(function(method) {
    if (phrase[method]) {

      var code;

      if (!phrase[method].codehash) {
        var isCandidate = errorAccumulator(vUtils.isValue, phrase[method].code, 'undefined:phrase:' + method + ':code');
        if (isCandidate) {
          code = phrase[method].code;
        }
      }

      if (!phrase[method].code) {
        var isValue = errorAccumulator(vUtils.isValue, phrase[method].codehash, 'undefined:phrase:' + method + ':codehash');
        var isValidBase64 = errorAccumulator(vUtils.isValidBase64, phrase[method].codehash, 'invalid:phrase:' + method + ':codehash');

        if (isValue && isValidBase64) {
          code = new Buffer(phrase[method].codehash, 'base64').toString('utf8');
        }
      }

      errorAccumulator(vUtils.isValue, phrase[method].doc, 'undefined:phrase:' + method + ':doc');

      try {
        var funct = new Function('req', 'res', 'next', 'corbelDriver', code); //jshint ignore:line
        var error = check(funct);
        if (error) {
          errors.push('error:phrase:syntax');
        }
      } catch (e) {
        errors.push('error:phrase:syntax:' + e);
      }

      methodPresent = true;
    }
  });

  if (!methodPresent) {
    errors.push('undefined:phrase:http_method');
  }

  return errors;
}

module.exports = validate;