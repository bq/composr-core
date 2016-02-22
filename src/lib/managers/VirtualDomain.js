'use strict';

var _ = require('lodash');
var BaseManager = require('./base.manager.js');
var virtualDomainValidator = require('../validators/virtualDomain.validator');

var VirtualDomainManager = function (options) {
  this.events = options.events;
  this.Phrases = options.Phrases;
  this.Snippets = options.Snippets;
};

VirtualDomainManager.prototype = new BaseManager({
  itemName: 'virtualDomain',
  item: '__virtualDomains',
  validator: virtualDomainValidator
});

//Compilation
VirtualDomainManager.prototype._compile = function (domain, vdomain) {
  return vdomain;
};

VirtualDomainManager.prototype._addToList = function (domain, vdModel) {
  if (!domain || !vdModel) {
    return false;
  }

  if (!this.__virtualDomains[domain]) {
    this.__virtualDomains[domain] = {};
  }

  this.__virtualDomains[domain] = vdModel;

  this.Phrases.register(domain, vdModel.getRawPhrases());
  this.Snippets.register(domain, vdModel.getRawSnippets());
  
  return true;
};

VirtualDomainManager.prototype._unregister = function (domain) {
  if (!domain) {
    this.events.emit('warn', 'virtualDomain:unregister:missing:parameters', domain);
    return false;
  }

  if (this.__virtualDomains[domain]) {
    //@TODO: go to phrases and unregister all
    delete this.__virtualDomains[domain];
    this.events.emit('debug', 'virtualDomain:unregistered', domain);
    return true;
  } else {
    this.events.emit('warn', 'virtualDomain:unregister:not:found', domain);
    return false;
  }
};

VirtualDomainManager.prototype.getVirtualDomains = function (domain) {
  if (!domain) {
    return this._getVirtualDomainsAsList();
  }

  return this.__virtualDomains[domain] ? this.__virtualDomains[domain] : null;
};

VirtualDomainManager.prototype._getVirtualDomainsAsList = function () {
  var module = this;
  return _.flatten(Object.keys(this.__phrases).map(function (key) {
    return module.__phrases[key];
  }));
};

module.exports = VirtualDomainManager;