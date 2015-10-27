'use strict';
var _ = require('lodash');

var prepareItems = function prepareItems(items) {
  if (!items){
    return [];
  }
  if (!Array.isArray(items)) {
    items = [items];
  }
  return  _.cloneDeep(items);
};

var removeSnippetsFromDataStructure = function removeSnippetsFromDataStructure(snippetsInput) {
  var module = this;
  var snippets = prepareItems(snippetsInput);
  var index;
  var indexes = [];
  snippets.forEach(function(newSnippet) {
    index = _.findIndex(module.data.snippets, function(oldSnippet) {
      return oldSnippet.id === newSnippet.id;
    });
    if (index !== -1){
      indexes.push(index);
    }
  });
  _.pullAt(module.data.snippets, _.uniq(indexes));
};

module.exports = removeSnippetsFromDataStructure;
