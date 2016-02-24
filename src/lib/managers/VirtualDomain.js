'use strict';

var _ = require('lodash');
var BaseManager = require('./base.manager.js');
var virtualDomainValidator = require('../validators/virtualDomain.validator');
var VirtualDomainModel = require('../models/VirtualDomainModel');
var virtualDomainDao = require('../daos/virtualDomainDao');
var virtualDomainStore = require('../stores/virtualDomain.store');

var VirtualDomainManager = function (options) {
  this.events = options.events;
  this.Phrases = options.Phrases;
  this.Snippets = options.Snippets;
};

VirtualDomainManager.prototype = new BaseManager({
  itemName: 'virtualDomain',
  store : virtualDomainStore,
  model : VirtualDomainModel,
  dao : virtualDomainDao,
  validator: virtualDomainValidator
});

VirtualDomainManager.prototype.getVirtualDomains = function (domain) {
  return this.store.getAsList(domain);
};

VirtualDomainManager.prototype.getById = function(id) {
  //@TODO
  var domain = this._extractDomainFromId(id);
  var vdomain = this.store.get(domain, id);

  if(!vdomain){
    return this.loadAndRegisterById(id);
  }
};

VirtualDomainManager.prototype.getByDomain = function(domain) {
  //@TODO
  var vdomains = this.store.getAsList(domain);
  if(vdomains.length === 0){
    this.loadAndRegisterByDomain(domain);
  }
};

VirtualDomainManager.prototype.getAll = function() {
  //TODO: 
  var vdomains = this.store.getAsList();
  if(vdomains.length === 0){
    this.loadAndRegisterAll();
  }
};

/*
  Receives a JSON of a virtual domain and saves the domain the phrases and snippets
 */
VirtualDomainManager.prototype.__save = function(vdJson) {
  //For each phrase, phrase dao save
  //for each snippet snippet dao save
  return Promise.all([
    this._savePhrases(vdJson.phrases),
    this._saveSnippets(vdJson.snippets),
    this.dao.save(_.omit(vdJson, ['phrases', 'snippets']))
  ]);
};

VirtualDomainManager.prototype._savePhrases = function(phrases){
  var module = this;

  var promises = phrases.map(function(phrase){
    return module.Phrases.save(phrase);
  });

  return Promise.all(promises);
};

VirtualDomainManager.prototype._saveSnippets = function(snippets){
  var module = this;

  var promises = snippets.map(function(snippet){
    return module.Snippets.save(snippet);
  });

  return Promise.all(promises);
};

module.exports = VirtualDomainManager;
