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

var checkAllNewItemsHaveDifferentIds = function checkAllNewItemsHaveDifferentIds(items) {
  return items.length === _.uniq(items, 'id').length;
};

var insertNewItems = function insertNewItems(oldItems,newItems) {
  var index;
  newItems.forEach(function(newPhrase) {
    index = _.findIndex(oldItems, function(oldPhrase) {
      return oldPhrase.id === newPhrase.id;
    });
    if (index === -1){
      oldItems.push(newPhrase);
    }
    else{
      oldItems[index] = newPhrase;
    }
  });
};

module.exports = {
  prepareItems: prepareItems,
  checkAllNewItemsHaveDifferentIds: checkAllNewItemsHaveDifferentIds,
  insertNewItems: insertNewItems
};
