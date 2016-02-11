'use strict';

var CodeCompiler = require('./compilers/code.compiler.js');
var virtualDomainValidator = require('./validators/virtualDomain.validator');

var VirtualDomainManager = function (options) {
  this.events = options.events;
};

VirtualDomainManager.prototype = new CodeCompiler({
  itemName: 'virtualDomain',
  item: '__virtualDomains',
  validator: virtualDomainValidator
});

//Compilation
VirtualDomainManager.prototype._compile = function (virtualDomain) {
  return virtualDomain;
};

VirtualDomainManager.prototype._addToList = function (domain, virtualDomain) {
  if (!domain || !virtualDomain) {
    return false;
  }

  if (!this.__virtualDomains[domain]) {
    this.__virtualDomains[domain] = {};
  }

  this.__virtualDomains[domain] = virtualDomain;
  return true;
};

VirtualDomainManager.prototype._unregister = function (domain) {
  if (!domain) {
    this.events.emit('warn', 'virtualDomain:unregister:missing:parameters', domain);
    return false;
  }

  if (this.__virtualDomains[domain]) {
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