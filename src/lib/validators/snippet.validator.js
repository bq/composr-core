'use strict';

var check = require('syntax-error'),
  q = require('q'),
  snippetFunctionWrapper = require('../compilers/snippet.wrapper'),
  utils = require('../utils'),
  vUtils = utils.values;



function validate(snippet) {
  var dfd = q.defer();

  var errors = [];

  var errorAccumulator = utils.errorAccumulator(errors);

  errorAccumulator(vUtils.isValue, snippet, 'undefined:snippet');
  errorAccumulator(vUtils.isValue, snippet.id, 'undefined:snippet:id');
  errorAccumulator(vUtils.isValue, snippet.codehash, 'undefined:snippet:codehash');

  //validate that id is well formed "domain!Name"
  if (snippet.id) {
    var parts = snippet.id.split('!');
    if (parts.length < 2) {
      errors.push('error:invalid:snippet:id');
    }
  }


  var isValue = errorAccumulator(vUtils.isValue, snippet.codehash, 'undefined:snippet:codehash');
  var isValidBase64 = errorAccumulator(vUtils.isValidBase64, snippet.codehash, 'invalid:snippet:codehash');

  var code;

  if (isValue && isValidBase64) {
    code = new Buffer(snippet.codehash, 'base64').toString('utf8');
  }


  try {
    var funct = new Function('exports', code); //jshint ignore:line
    var error = check(funct);
    if (error) {
      errors.push('error:snippet:syntax');
    }
  } catch (e) {
    errors.push('error:snippet:syntax:' + e);
  }

  code = snippetFunctionWrapper(code);

  if (code.indexOf('exports(') === -1) {
    errors.push('error:missing:exports');
  }

  if (errors.length > 0) {
    dfd.reject(errors);
  } else {
    dfd.resolve(snippet);
  }


  return dfd.promise;
}

module.exports = validate;