'use strict';

var _ = require('lodash');

var PhraseModel = function(json, domain, compiled){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id ? json.id : this._generateId(domain);
  this.compiled = true;
};

PhraseModel.prototype.getId = function() {
  return this.id;
};

PhraseModel.prototype._generateId = function(domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

module.exports = PhraseModel;