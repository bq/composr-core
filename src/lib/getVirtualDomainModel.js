'use strict';
var q = require('q');
var VirtualDomainModel = require('./models/VirtualDomainModel');

var getVirtualDomainModel = function getVirtualDomainModel(vdomain) {

  //TODO asume we are having an array of IDs
  var promises = [
    this.phraseDao.loadSome(vdomain.phrases), 
    this.snippetDao.loadSome(vdomain.snippets)
  ];

  return new Promise(function(resolve, reject){
    q.spread(promises, function(phrases, snippets){
      var vdDomainModel = new VirtualDomainModel(vdomain, phrases, snippets);
      resolve(vdDomainModel);
    })
    .catch(function(err) {
      module.events.emit('warn', 'data:error:loading');
      reject(err && err.data ? err.data : err);
    });
  });
};

module.exports = getVirtualDomainModel;