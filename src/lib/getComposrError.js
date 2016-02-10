'use strict';

var ComposrError = require('./ComposrError');

function getComposrError(e, defaultError) {

  var status = 500;
  var error = defaultError;
  var errorDescription = e;

  if (typeof e === 'object'){

    if (e.status || e.statusCode){
      status = e.status ? e.status : e.statusCode;
    }

    if (e.error){
      error = e.error;
    }

    if (e.errorDescription){
      errorDescription = e.errorDescription;
    }
  }

  return new ComposrError(error, errorDescription, status);
}

module.exports = getComposrError;