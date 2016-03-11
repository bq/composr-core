'use strict';
var BaseManager = require('./base.manager.js');
var SnippetModel = require('../models/SnippetModel.js');
var snippetsStore = require('../stores/snippets.store');
var snippetDao = require('../daos/snippetDao');

var snippetValidator = require('../validators/snippet.validator.js');

var SnippetsManager = function(options) {
  this.events = options.events;
};

SnippetsManager.prototype = new BaseManager({
  itemName: 'snippet',
  store: snippetsStore,
  model : SnippetModel,
  dao : snippetDao,
  validator: snippetValidator
});

//Compilation
SnippetsManager.prototype._compile = function(domain, snippet) {
  try {
    var snippetModel = new this.model(snippet, domain);

    snippetModel.compile(this.events);

    this.events.emit('debug', 'snippet:compiled', snippetModel.getId(), snippetModel.getName());

    return snippetModel;
  } catch (e) {
    //Somehow it has tried to compile an invalid snippet. Notify it and return false.
    //Catching errors and returning false here is important for not having an unstable snippets stack.
    this.events.emit('error', 'snippet:not:usable', snippet.id, e);
    return false;
  }
};

//Get all the snippets for a single domain
SnippetsManager.prototype.getSnippets = function(domain) {
  if (!domain) {
    return null;
  }

  return this.store.getAsList(domain);
};

//Get a single snippet
SnippetsManager.prototype.getSnippet = function(domain, name, version) {
  var snippet = this.store.get(domain, domain + '!' + name + '-' + version);

  if (snippet) {
    return snippet;
  } else {
    return null;
  }
};

module.exports = SnippetsManager;