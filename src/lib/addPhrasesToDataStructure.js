'use strict';
var commonsAddToDataStructure = require('./commonsAddToDataStructure.js');

var addPhrasesToDataStructure = function addPhrasesToDataStructure(phrasesInput) {
  var module = this;
  var phrases = commonsAddToDataStructure.prepareItems(phrasesInput);
  var newPhrasesHaveCorrectIds = commonsAddToDataStructure.checkAllNewItemsHaveDifferentIds(phrases);
  if (newPhrasesHaveCorrectIds){
    commonsAddToDataStructure.insertNewItems(module.data.phrases,phrases);
  }
};

module.exports = addPhrasesToDataStructure;
