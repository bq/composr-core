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
  phrases.forEach(function(phrase1) {
    if (!phrase1.id) {return false;}
    phrases.forEach(function(phrase2) {
      if (!phrase1.id) {return false;}
      if (phrase1.id === phrase2.id){
        return false;
      }
    });
  });
  return true;
};


var removeOldPhrasesToBeOverridedByNewOnes = function removeOldPhrasesToBeOverridedByNewOnes(oldPhrases,newPhrases) {
  var phrasesToBeDeleted = [];
  for (var indexOldPhrase=0; indexOldPhrase<oldPhrases.length; indexOldPhrase++){
    for (var indexNewPhrase=0; indexNewPhrase<newPhrases.length; indexNewPhrase++){
      if (oldPhrases[indexOldPhrase].id === newPhrases[indexNewPhrase].id){
        phrasesToBeDeleted.push(indexOldPhrase);
      }
    }
  }
  phrasesToBeDeleted.sort();
  phrasesToBeDeleted.reverse();
  for (var i=0; i<phrasesToBeDeleted.length; i++){
    oldPhrases.splice(i, 1);
  }
  return oldPhrases;
};

var insertNewPhrases = function insertNewPhrases(oldPhrases,newPhrases) {
  oldPhrases.push(newPhrases);
  return oldPhrases;
};


var addPhraseToDataStructure = function addPhraseToDataStructure(phrasesInput) {
  var module = this;
  var phrases = preparePhrases(phrasesInput);
  var newPhrasesHaveCorrectIds = checkAllNewPhrasesHaveDifferentIds(phrases);
  if (newPhrasesHaveCorrectIds){
    module.data.phrases = removeOldPhrasesToBeOverridedByNewOnes(module.data.phrases,phrases);
    module.data.phrases = insertNewPhrases(module.data.phrases,phrases);
  }
};

module.exports = addPhraseToDataStructure;
