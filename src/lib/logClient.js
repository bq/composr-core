'use strict';

var q = require('q');
var ComposrError = require('./ComposrError');


function logClient() {
  /*jshint validthis:true */
  var dfd = q.defer();

  this.corbelDriver.iam.token().create().then(function(response) {
    if(response.data){
      dfd.resolve();
    }else{
      dfd.reject(new ComposrError('error:invalid:credentials', '', 401));
    }
  }).catch(function(error) {
    dfd.reject(new ComposrError(error, '', 401));
    //TODO: take into account that this error and this succes may be logged and notified to pmx
  });

  return dfd.promise;
}

/*function regenerateDriver() {
  return corbelDriver.iam.token().create().then(function() {
    logger.debug('corbel:connection:success');
    return corbelDriver;
  }).catch(function(error) {
    logger.error('error:composer:corbel:token', error.response.body);
    pmx.notify('error:composer:corbel:token', error.response.body);
    throw new ComposrError('error:composer:corbel:token', '', 401);
  });
}*/


module.exports = logClient;