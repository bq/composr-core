'use strict';

var _ = require('lodash');
var BaseModel = require('./BaseModel');

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

  this.id = this._generateId(domain);
  this.domain = domain;

  this.json.id = this.id;
};

VirtualDomainModel.prototype = new BaseModel();

VirtualDomainModel.prototype.getMiddlewares = function () {
  return this.json.middlewares;
};

VirtualDomainModel.prototype.getName = VirtualDomainModel.prototype.getApiId = function () {
  return this.json.api_id;
};

module.exports = VirtualDomainModel;

 