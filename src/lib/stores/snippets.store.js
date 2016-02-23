'use strict';

var _ = require('lodash');
var snippets = {};

function add(domain, vModel){
  if (!snippets[domain]) {
    snippets[domain] = {};
  }

  snippets[domain][vModel.getId()] = vdModel;
}

function remove(domain, id){
  delete snippets[domain][id];
}

function exists(domain, id){
  return snippets[domain] && snippets[domain][id];
}

function get(domain, id){
  if(exists(domain, id)){
    return snippets[domain][id];
  }else{
    return null;
  }
}

function getAsList(domain){
  if(domain){
    //TODO: Return as array of snippets of that domain
  }else{
    return _.flatten(Object.keys(snippets).map(function (key) {
      return snippets[key];
    }));
  }
}

function getAsObject(domain){
  if(domain){
    return snippets[domain];
  }else{
    //TODO: return as single level object
  }
}

module.exports = {
  add : add,
  get : get,
  getAsList : getAsList,
  getAsObject : getAsObject,
  remove: remove
  exists : exists
};