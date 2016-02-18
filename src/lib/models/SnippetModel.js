'use strict';

var _ = require('lodash');

var SnippetModel = function(json, domain){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id ? json.id : this._generateId(domain);
};

SnippetModel.prototype.getId = function() {
  return this.id;
};

SnippetModel.prototype._generateId = function(domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

module.exports = SnippetModel;