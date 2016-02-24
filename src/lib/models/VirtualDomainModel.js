'use strict';

var _ = require('lodash');

/**
 * virtualDomain json example
 * {
 *   "id": "domain!api",
 *   "name": "composr-cli",
 *   "author": "jorge-serrano",
 *   "version": "1.0.0",
 *   "source_location": "./src",
 *   "git": "",
 *   "license": "MIT",
 *   "middlewares": ["validation", "mock"]
 *   "vd_dependencies": {},
 *   "_apiRML": {}
 * }
 */
var VirtualDomainModel = function (json, domain) {
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object

  this.id = json.id ? json.id : this._generateId(domain);
};

VirtualDomainModel.prototype.getMiddlewares = function () {
  return this.json.middlewares;
};

VirtualDomainModel.prototype.getId = function () {
  return this.id;
};

VirtualDomainModel.prototype.getDomain = function () {
  return this.id.split('!')[0];
};

VirtualDomainModel.prototype.getApiId = function () {
  return this.id.split('!')[1];
};

VirtualDomainModel.prototype._generateId = function (domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

VirtualDomainModel.prototype.getMD5 = function(){
  return this.json.md5;
};

module.exports = VirtualDomainModel;

 