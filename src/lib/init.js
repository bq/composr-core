'use strict';

var q = require('q');

function init(options) {
  /*jshint validthis:true */
  var dfd = q.defer();
  var module = this;

  this.config = this.bindConfiguration(options);

  //Corbel collections  
  this.resources = {
    phrasesCollection: 'composr:Phrase',
    snippetsCollection: 'composr:Snippets'
  };

  //Do the stuff
  this.initCorbelDriver()
    .then(function(){
      return module.logClient();
    })
    .then(function() {
      return module.fetchData();
    })
    .then(function() {
      return module.registerData();
    })
    .then(function() {
      module.events.emit('init:ok');
      dfd.resolve();
    })
    .catch(function(err) {
      dfd.reject(err);
    });

  return dfd.promise;
}

module.exports = init;