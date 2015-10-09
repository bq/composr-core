'use strict';

var q = require('q');

var fetchData = function fetchData() {
  var module = this;
  var dfd = q.defer();

  var promises = [this.loadPhrases(), this.loadSnippets()];

  q.spread(promises, function(phrases, snippets) {
    module.data.phrases = phrases;
    module.data.snippets = snippets;
    module.events.emit('debug', 'data:loaded', 'phrases', phrases.length, 'snippets', snippets.length);
    dfd.resolve();
  })
  .catch(function(err) {
    module.events.emit('warn', 'data:error:loading');
    dfd.reject(err);
  });

  return dfd.promise;

};


module.exports = fetchData;