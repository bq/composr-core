'use strict';

var loadPhrases = function loadPhrases(){
  var module = this;
  var caller = function(pageNumber, pageSize) {
    return module.corbelDriver.resources.collection(module.resources.phrasesCollection).get({
      pagination: {
        page: pageNumber,
        size: pageSize
      }
    });
  };

  return this.utils.getAllRecursively(caller);
};

module.exports = loadPhrases;