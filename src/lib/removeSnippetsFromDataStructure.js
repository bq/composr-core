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

var removeSnippetsFromDataStructure = function removeSnippetsFromDataStructure(snippetsIdsInput) {
  var module = this;
  var snippetsIds = prepareItems(snippetsIdsInput);
  var index;
  var indexes = [];
  snippetsIds.forEach(function(newSnippetId) {
    index = _.findIndex(module.data.snippets, function(oldSnippet) {
      return oldSnippet.id === newSnippetId;
    });
    if (index !== -1){
      indexes.push(index);
    }
  });
  _.pullAt(module.data.snippets, _.uniq(indexes));
};

module.exports = removeSnippetsFromDataStructure;
