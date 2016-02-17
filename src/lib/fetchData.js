'use strict';

var q = require('q');

var fetchData = function fetchData() {
  var module = this;
  var dfd = q.defer();

  var promises = [this.phraseDao.loadAll(), this.snippetDao.loadAll(), this.virtualDomainDao.loadAll()];

  q.spread(promises, function(phrases, snippets, virtualDomains) {
    module.data.phrases = phrases;
    module.data.snippets = snippets;
    module.data.virtualDomains = virtualDomains;
    module.events.emit('debug', 'data:loaded',
      'phrases', phrases.length,
      'snippets', snippets.length,
      'virtualDomains', virtualDomains.length);
    dfd.resolve();
  })
  .catch(function(err) {
    module.events.emit('warn', 'data:error:loading');
    dfd.reject(err && err.data ? err.data : err);
  });

  return dfd.promise;

};


module.exports = fetchData;