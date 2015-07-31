'use strict';

var corbel = require('corbel-js');
var q = require('q');

function initCorbelDriver() {
  /*jshint validthis:true */
  var dfd = q.defer();
  
  try{
    this.corbelDriver = corbel.getDriver(this.config.credentials);
    dfd.resolve();
  }catch(e){
    this.corbelDriver = null;
    dfd.reject(e);
  }

  return dfd.promise;
}

module.exports = initCorbelDriver;