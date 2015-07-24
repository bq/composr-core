'use strict';

var q = require('q');

function logClient(){
  var dfd = q.defer();
  //TODO: log client for composr
  return dfd.promise;
}

module.exports = logClient;