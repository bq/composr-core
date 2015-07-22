'use strict';

var corbel = require('corbel-js');
var q = require('q');

function init(credentials, config) {
  /*jshint validthis:true */
  var dfd = q.defer();

  this.credentials = credentials;

  this.config = this.bindConfiguration(config);

  //Corbel collections  
  this.resources = {
    phrasesCollection: 'composr:Phrase',
    snippetsCollection: 'composr:Snippets'
  };

  //Loaded resources
  this.data = {
    phrases: null,
    snippets: null
  };

  //corbelDriver
  this.corbelDriver = corbel.getDriver(credentials);

  //Do the stuff
  this.logClient()
    .then(function() {
      return this.fetchData();
    })
    .then(function() {
      return this.registerData();
    })
    .then(function() {
      this.events.emit('init:ok');
      dfd.resolve();
    })
    .catch(function(err) {
      dfd.reject(err);
    });

  return dfd.promise;
}

module.exports = init;