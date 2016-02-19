'use strict';
var q = require('q');
var VirtualDomainModel = require('./models/VirtualDomainModel');

var getVirtualDomainModel = function getVirtualDomainModel(vdomain) {

  //TODO asume we are having an array of IDS

  var promises = [
    this.phraseDao.loadSome(vdomain.phrases), 
    this.snippetDao.loadSome(vdomain.snippets)
  ];

  return q.spread(promises, function(phrases, snippets){
    var vdDomainModel = new VirtualDomainModel(vdomain, phrases, snippets);
    dfd.resolve(vdDomainModel);
  })
  .catch(function(err) {
    module.events.emit('warn', 'data:error:loading');
    dfd.reject(err && err.data ? err.data : err);
  });

  return dfd.promise;

};


module.exports = getVirtualDomainModel;