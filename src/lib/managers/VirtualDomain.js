'use strict';

var _ = require('lodash');
var BaseManager = require('./base.manager.js');
var virtualDomainValidator = require('../validators/virtualDomain.validator');
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
  var domain = this._extracDomainFromId(id);
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
  var validationResult = this.validate(vdJson);

  if(validationResult.valid === true){
    this._savePhrases(vdJson.phrases);
    this._saveSnippets(vdJson.snippets);
    this._saveVdomain(_.omit(vdJson, ['phrases', 'snippets']);
  }
};

VirtualDomainManager.prototype._savePhrases = function(phrases){
  console.log('Saving phrases', phrases);
};

VirtualDomainManager.prototype._saveSnippets = function(snippets){
  console.log('Saving snippets', snippets);
};

VirtualDomainManager.prototype._saveVdomain = function(vdomain){
  console.log('Saving vdomain', vdomain);
};


module.exports = VirtualDomainManager;
