'use strict';

var loadSnippets = function loadSnippets(){
  var that = this;
  var caller = function(pageNumber, pageSize) {
    return that.corbelDriver.resources.collection(that.resources.snippetsCollection).get({
      pagination: {
        page: pageNumber,
        size: pageSize
      }
    });
  };

  return this.utils.getAllRecursively(caller);
};

module.exports = loadSnippets;