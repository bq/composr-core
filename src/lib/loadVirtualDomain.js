'use strict';

var loadDomain = function loadDomain(id) {
  var module = this;

  return this.virtualDomainDao.load(id)
    .then(function(vdomain){
      return module.getVirtualDomainModels(vdomain);
    })
    .then(function(vmodel){
      module.events.emit('debug', 
        'VirtualDomain', vmodel.getId(), 
        'Phrases', vmodel.getRawPhrases().length,
        'Snippets', vmodel.getRawSnippets().length);
      return vmodel;
    })
    .catch(function(err) {
      module.events.emit('warn', 'data:error:loading');
      return Promise.reject(err && err.data ? err.data : err);
    });

};

module.exports = loadDomain;