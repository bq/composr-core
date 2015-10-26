'use strict';

var _ = require('lodash');

var preparePhrases = function preparePhrases(phrases) {
  if (!phrases){
    return [];
  }
  if (!Array.isArray(phrases)) {
    phrases = [phrases];
  }
  return  _.cloneDeep(phrases);
};

var checkAllNewPhrasesHaveDifferentIds = function checkAllNewPhrasesHaveDifferentIds(phrases) {
  return phrases.length === _.uniq(phrases, 'id').length;
};

var insertNewPhrases = function insertNewPhrases(oldPhrases,newPhrases) {
  var index;
  newPhrases.forEach(function(newPhrase) {
    index = _.findIndex(oldPhrases, function(oldPhrase) {
      return oldPhrase.id === newPhrase.id;
    });
    if (index === -1){
      oldPhrases.push(newPhrase);
    }
    else{
      oldPhrases[index] = newPhrase;
    }
  });
};

var addPhrasesToDataStructure = function addPhrasesToDataStructure(phrasesInput) {
  var module = this;
  var phrases = preparePhrases(phrasesInput);
  var newPhrasesHaveCorrectIds = checkAllNewPhrasesHaveDifferentIds(phrases);
  if (newPhrasesHaveCorrectIds){
    insertNewPhrases(module.data.phrases,phrases);
  }
};

module.exports = addPhrasesToDataStructure;
