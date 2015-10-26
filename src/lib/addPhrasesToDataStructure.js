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
  for (var i=0;i<phrases.length;i++){
    for (var j=0;j<phrases.length;j++){
      if ( (!phrases[j].id) ||  ((i !== j) && (phrases[i].id === phrases[j].id)) ){
        return false;
      }
    }
  }
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
  newPhrases.forEach(function(phrase) {
    oldPhrases.push(phrase);
  });
  return oldPhrases;
};


var addPhrasesToDataStructure = function addPhrasesToDataStructure(phrasesInput) {
  var module = this;
  var phrases = preparePhrases(phrasesInput);
  var newPhrasesHaveCorrectIds = checkAllNewPhrasesHaveDifferentIds(phrases);
  if (newPhrasesHaveCorrectIds){
    var oldPhrases = module.data.phrases;
    oldPhrases = removeOldPhrasesToBeOverridedByNewOnes(oldPhrases,phrases);
    module.data.phrases = insertNewPhrases(oldPhrases,phrases);
  }
};

module.exports = addPhrasesToDataStructure;
