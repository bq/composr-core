'use strict';

var _ = require('lodash');

var phrases = {};

function getAsList(domain){
  var list = [];

  if (!domain) {
    list = _.flatten(Object.keys(phrases).map(function(key) {
      return phrases[key];
    }));
  } else if (phrases[domain]) {
    list = phrases[domain];
  }

  return list;
}

function getPhraseIndexById(domain, id){
  var candidates = getAsList(domain);
  var index = -1;

  for (var i = 0; i < candidates.length; i++) {
    if (candidates[i].getId() === id) {
      index = i;
      break;
    }
  }

  return index;
}

function add(domain, phraseModel){
  
  if (!phrases[domain]) {
    phrases[domain] = [];
  }

  var index = getPhraseIndexById(domain, phraseModel.getId());

  if (index === -1) {
    phrases[domain].push(phraseModel);
  } else {
    phrases[domain][index] = phraseModel;
  }
}

function remove(domain, id){
  var index = getPhraseIndexById(domain, id);
  if (index !== -1) {
    phrases[domain].splice(index, 1);
  }
}

function exists(domain, id){
  return getPhraseIndexById(domain, id) !== -1;
}

function get(domain, id){
  var candidates = getAsList(domain);
  var index = getPhraseIndexById(domain, id);

  return index !== -1 ? candidates[index] : null;
}

module.exports = {
  add : add,
  get : get,
  getAsList : getAsList,
  remove: remove,
  exists : exists
};