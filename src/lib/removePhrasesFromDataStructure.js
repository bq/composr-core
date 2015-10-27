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

var removePhrasesFromDataStructure = function removePhrasesFromDataStructure(phrasesInput) {
  var module = this;
  var phrases = prepareItems(phrasesInput);
  var index;
  var indexes = [];
  phrases.forEach(function(newPhrase) {
    index = _.findIndex(module.data.phrases, function(oldPhrase) {
      return oldPhrase.id === newPhrase.id;
    });
    if (index !== -1){
      indexes.push(index);
    }
  });
  _.pullAt(module.data.phrases, _.uniq(indexes));
};

module.exports = removePhrasesFromDataStructure;
