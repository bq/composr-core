'use strict';

var _ = require('lodash');

var PhraseModel = function(json, domain){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id ? json.id : this._generateId(domain);
}

PhraseModel.prototype.compile = function(parameters){
  //@TODO:
}

PhraseModel.prototype.getId = function() {
  // body...
};

PhraseModel.prototype._generateId = function(domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

module.exports = PhraseModel