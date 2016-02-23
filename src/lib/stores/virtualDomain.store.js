'use strict';

var _ = require('lodash');
var virtualDomains = {};

function add(domain, vModel){
  if (!virtualDomains[domain]) {
    virtualDomains[domain] = {};
  }

  virtualDomains[domain][vModel.getId()] = vdModel;
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

module.exports = {
  add : add,
  get : get,
  getAsList : getAsList,
  remove: remove
  exists : exists
};