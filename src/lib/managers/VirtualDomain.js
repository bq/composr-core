'use strict';

var _ = require('lodash');
var BaseManager = require('./base.manager.js');
var virtualDomainValidator = require('../validators/virtualDomain.validator');
var virtualDomainDao = require('../loaders/virtualDomainDao')

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
VirtualDomainManager.prototype._compile = function (vdomain) {
  return vdomain;
};

VirtualDomainManager.prototype._addToList = function (domain, vdModel) {
  if (!domain || !vdModel) {
    return false;
  }

  if (!this.__virtualDomains[domain]) {
    this.__virtualDomains[domain] = {};
  }

  this.__virtualDomains[domain][vModel.getApiId()] = vdModel;

  this.Phrases.register(this.domain, vdModel.getRawPhrases());
  this.Snippets.register(this.domain, vdModel.getRawSnippets());
  
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

VirtualDomainManager.prototype.getById = function(id) {
    var domain = this._extracDomainFromId

    if(this.__virtualDomains[domain][id] && _.size(this.__virtualDomains[domain][id]) > 0){
        return this.__virtualDomains[domain][id]
    } else {
        return this.loadAndRegisterById(id)
    }
};

VirtualDomainManager.prototype.getByDomain = function(domain) {
    if(this.__virtualDomains[domain] && _.size(this.__virtualDomains[domain]) > 0){
        return this.__virtualDomains[domain]
    } else {
        return this.loadAndRegisterByDomain(domain)
    }
};

VirtualDomainManager.prototype.getAll = function() {
    if(this.__virtualDomains && _.size(this.__virtualDomains) > 0){
        return this.__virtualDomains
    } else {
        return this.loadAndRegisterAll()
    }
};

VirtualDomainManager.prototype.loadAndRegisterById = function(id) {
    var that = this
    var vd
    var domain = this._extracDomainFromId(id)

    return virtualDomainDao.load(id)
    .then(function(vd){
        return that.getVirtualDomainModels(vd)
    })
    .then(function(vdModel){
         that.events.emit('debug', 
        'VirtualDomain', vmodel.getId(), 
        'Phrases', vmodel.getRawPhrases().length,
        'Snippets', vmodel.getRawSnippets().length);

        return this._register(domain, vdModel)
    })
    .catch(function(err) {
      that.events.emit('warn', 'data:error:loading');
      return Promise.reject(err && err.data ? err.data : err);
    });

};

VirtualDomainManager.prototype.loadAndRegisterByDomain = function(domain) {
};

VirtualDomainManager.prototype.loadAndRegisterAll = function() {
};

VirtualDomainManager.prototype.save = function(vd) {
};

VirtualDomainManager.prototype.validate = function(vd) {
    return this.validate(vd)
};

module.exports = VirtualDomainManager;
