'use strict';

var _ = require('lodash');

var virtualDomains = {};

function add(domain, vdModel){
  if (!virtualDomains[domain]) {
    virtualDomains[domain] = {};
  }

  virtualDomains[domain][vdModel.getId()] = vdModel;
}

function remove(domain, id){
  delete virtualDomains[domain][id];
}

function exists(domain, id){
  return virtualDomains[domain] && virtualDomains[domain][id];
}

function get(domain, id){
  if(exists(domain, id)){
    return virtualDomains[domain][id];
  }else{
    return null;
  }
}

function getAsList(){
  return _.flatten(Object.keys(virtualDomains).map(function (key) {
    return virtualDomains[key];
  }));
}

function reset(){
  virtualDomains = {};
}

module.exports = {
  add : add,
  get : get,
  getAsList : getAsList,
  remove: remove,
  reset : reset,
  exists : exists
};