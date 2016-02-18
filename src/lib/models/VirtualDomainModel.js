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
  // id = domain!apiId
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

// TODO: Does this belong here or is it part of the cli?
// TODO: composr-core or corbel-composr?
VirtualDomainModel.prototype.getRawPhrases = function () {
  var phrases = [];
  try {
    this._searchPhrasesOnResource(phrases, this.json._apiRML.resources, '');
  } catch (err) {
    console.log(err);
    throw err;
  }
  return phrases;
};

VirtualDomainModel.prototype._generateId = function (domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

VirtualDomainModel.prototype._searchPhrasesOnResource = function (phrases, resources, accumulatedPath) {
  if (!resources) {
    return phrases;
  }

  resources.forEach(function (resource) {
    var path = accumulatedPath + resource.relativeUri;

    var phrase = {};
    phrase.url = path;
    resource.methods.forEach(function (method) {
      phrase[method.method] = {};
      // TODO: Are we sending the code here?
      phrase[method.method].code = method.codehash;
      // TODO: delete custom raml attributes such as codehash
      phrase[method.method].doc = method;
    });
    phrases.push(phrase);

    this._searchPhrasesOnResource(phrases, resource.resources, path);
  });

  return phrases;
};

module.exports = VirtualDomainModel;

 