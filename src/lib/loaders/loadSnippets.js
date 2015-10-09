'use strict';

var loadSnippets = function loadSnippets(){
  var module = this;
  var caller = function(pageNumber, pageSize) {
    return module.corbelDriver.resources.collection(module.resources.snippetsCollection).get({
      pagination: {
        page: pageNumber,
        pageSize: pageSize
      }
    });
  };

  return this.utils.getAllRecursively(caller);
};

module.exports = loadSnippets;