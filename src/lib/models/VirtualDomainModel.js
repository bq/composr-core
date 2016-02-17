'use strict';

var _ = require('lodash');

var VirtualDomainModel = function(json, domain){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id ? json.id : this._generateId(domain);
}

VirtualDomainModel.prototype.compile = function(parameters){
  //@TODO:
}

VirtualDomainModel.prototype.getId = function() {
  // body...
};

VirtualDomainModel.prototype._generateId = function(domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

module.exports = VirtualDomainModel

 