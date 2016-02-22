'use strict';
var BaseManager = require('./base.manager.js');
var SnippetModel = require('../models/SnippetModel.js');
var snippetValidator = require('../validators/snippet.validator.js');

var SnippetsManager = function(options) {
  this.events = options.events;
};

SnippetsManager.prototype = new BaseManager({
  itemName: 'snippet',
  item: '__snippets',
  validator: snippetValidator
});

//Compilation
SnippetsManager.prototype._compile = function(domain, snippet) {
  try {
    var snippetModel = new SnippetModel(snippet, domain);

    snippetModel.compile(this.events);

    this.events.emit('debug', 'snippet:compiled', snippetModel.getId(), snippetModel.getName());

    return snippetModel;
  } catch (e) {
    console.log(e);
    //Somehow it has tried to compile an invalid snippet. Notify it and return false.
    //Catching errors and returning false here is important for not having an unstable snippets stack.
    this.events.emit('error', 'snippet:not:usable', snippet.id, e);
    return false;
  }
};

SnippetsManager.prototype._addToList = function(domain, snippetModel) {
  if (!domain || !snippetModel) {
    return false;
  }

  if (typeof(snippetModel) !== 'object' || snippetModel.hasOwnProperty('id') === false || !snippetModel.getId()) {
    return false;
  }

  if (!this.__snippets[domain]) {
    this.__snippets[domain] = {};
  }

  this.__snippets[domain][snippetModel.getId()] = snippetModel;
  return true;
};

SnippetsManager.prototype._unregister = function(domain, id) {
  if (!domain || !id) {
    this.events.emit('warn', 'snippet:unregister:missing:parameters', domain, id);
    return false;
  }

  if (this.__snippets[domain] && this.__snippets[domain][id]) {
    delete this.__snippets[domain][id];
    this.events.emit('debug', 'snippet:unregistered', id);
    return true;
  } else {
    this.events.emit('warn', 'snippet:unregister:not:found', domain, id);
    return false;
  }
};

//Get all the snippets for a single domain
SnippetsManager.prototype.getSnippets = function(domain) {
  if (!domain) {
    return null;
  }

  return this.__snippets[domain] ? this.__snippets[domain] : null;
};

//Get a single snippet
SnippetsManager.prototype.getByName = function(domain, name) {
  var snippets = this.getSnippets(domain);

  if (snippets) {
    return snippets[domain + '!' + name] ? snippets[domain + '!' + name] : null;
  } else {
    return null;
  }
};

module.exports = SnippetsManager;