'use strict';
var commonsAddToDataStructure = require('./commonsAddToDataStructure.js');

var addSnippetsToDataStructure = function addSnippetsToDataStructure(snippetsInput) {
  var module = this;
  var snippets = commonsAddToDataStructure.prepareItems(snippetsInput);
  var newSnippetsHaveCorrectIds = commonsAddToDataStructure.checkAllNewItemsHaveDifferentIds(snippets);
  if (newSnippetsHaveCorrectIds){
    commonsAddToDataStructure.insertNewItems(module.data.snippets,snippets);
  }
};

module.exports = addSnippetsToDataStructure;
