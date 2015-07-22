'use strict';

var q = require('q');

var fetchData = function fetchData(){
  var that = this;
  var dfd = q.defer();

  var promises = [this.loadPhrases(), this.loadSnippets()];

  q.spread(promises)
    .then(function(phrases, snippets){
      that.data.phrases = phrases;
      that.data.snippets = snippets;
      that.events.emit('data:loaded');
      dfd.resolve();
    })
    .catch(function(err){
      that.events.emit('data:error:loading');
      dfd.reject(err);
    });

  return dfd.promise;

};


module.exports = fetchData;