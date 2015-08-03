'use strict';

var check = require('syntax-error'),
  vUtils = require('./validate.utils');


function validationErrorsAcc(errors) {
  return function(validation, field, err) {
    var ok = validation(field);
    if (!ok) {
      errors.push(err);
    }
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

      if (!phrase[method].codehash) {
        errorAccumulator(vUtils.isValue, phrase[method].code, 'undefined:phrase:' + method + ':code');
      }

      if (!phrase[method].code) {
        errorAccumulator(vUtils.isValue, phrase[method].codehash, 'undefined:phrase:' + method + ':codehash');
        errorAccumulator(vUtils.isValidBase64, phrase[method].codehash, 'invalid:phrase:' + method + ':codehash');
      }

      errorAccumulator(vUtils.isValue, phrase[method].doc, 'undefined:phrase:' + method + ':doc');

      var code = phrase[method].code ? phrase[method].code : new Buffer(phrase[method].codehash, 'base64').toString('utf8');

      var funct = new Function('req', 'res', 'next', 'corbelDriver', code);//jshint ignore:line
      var error = check(funct);
      if (error) {
        errors.push('error:phrase:syntax');
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