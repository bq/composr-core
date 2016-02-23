'use strict';

var _ = require('lodash');
var BaseManager = require('./base.manager.js');
var virtualDomainValidator = require('../validators/virtualDomain.validator');
var VirtualDomainModel = require('../models/VirtualDomainModel');
var virtualDomainDao = require('../loaders/virtualDomainDao');
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
  validator: virtualDomainValidator
});

//Compilation
VirtualDomainManager.prototype._compile = function (domain, vdomain) {
  return vdomain;
};

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

/*
  Receives a JSON of a virtual domain and saves the domain the phrases and snippets
 */
VirtualDomainManager.prototype.save = function(vdJson) {
  //For each phrase, phrase dao save
  //for each snippet snippet dao save
  var module = this;

  return new Promise(function(resolve, reject){
    var validationResult = this.validate(vdJson);

    if(validationResult.valid === true){
     
      Promise.all([
        module._savePhrases(vdJson.phrases),
        module._saveSnippets(vdJson.snippets),
        module._saveVdomain(_.omit(vdJson, ['phrases', 'snippets'])
      ])
      .then(resolve)
      .catch(reject);
    }else{
      reject(validationResult);
    }
  });
};

VirtualDomainManager.prototype._savePhrases = function(phrases){
  //TODO: for each phrase check if in the phrase manager its MD5 differs, if it differs, trigger save
  console.log('Saving phrases', phrases);
  return Promise.resolve();
};

VirtualDomainManager.prototype._saveSnippets = function(snippets){
  //TODO: for each snippet check if in the snippet manager its MD5 differs, if it differs, trigger save
  console.log('Saving snippets', snippets);
  return Promise.resolve();
};

VirtualDomainManager.prototype._saveVdomain = function(vdomain){
  //TODO: for the vdomain check if in the store its MD5 differs, if it differs, trigger save
  console.log('Saving vdomain', vdomain);
  return Promise.resolve();
};


module.exports = VirtualDomainManager;
