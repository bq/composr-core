'use strict';
var CodeCompiler = require('./compilers/code.compiler.js');
var snippetValidator = require('./validators/snippet.validator.js');
//var utils = require('./utils');

//var q = require('q');
//var _ = require('lodash');

var SnippetsManager = function() {};

SnippetsManager.prototype = new CodeCompiler({
  itemName: 'snippet',
  item: '__snippets',
  validator: snippetValidator
});

//Compilation
SnippetsManager.prototype._compile = function(snippet) {
  try {
    var compiled = {
      id: snippet.id,
      code: null
    };

    compiled.code = this._evaluateCode(snippet.code, ['exports']);

    this.events.emit('debug', 'snippet:compiled', compiled);

    return compiled;

  } catch (e) {
    //Somehow it has tried to compile an invalid snippet. Notify it and return false.
    //Catching errors and returning false here is important for not having an unstable snippets stack.
    this.events.emit('error', 'snippet:not:usable', snippet.url, e);
    return false;
  }

};


SnippetsManager.prototype._addToList = function(domain, snippet) {
  if (!domain || !snippet) {
    return false;
  }

  if (typeof(snippet) !== 'object' || snippet.hasOwnProperty('id') === false || !snippet.id) {
    return false;
  }

  if (!this.__snippets[domain]) {
    this.__snippets[domain] = {};
  }

  this.__snippets[domain][snippet.id] = snippet;
  return true;
};

//Get all the snippets for a single domain
SnippetsManager.prototype.getSnippets = function(domain) {
  if (!domain) {
    return null;
  }

  return this.__snippets[domain] ? this.__snippets[domain] : null;
};

//Get a single snippet
SnippetsManager.prototype.getById = function(domain, id) {
  var snippets = this.getSnippets(domain);

  if (snippets) {
    return snippets[id];
  } else {
    return null;
  }
};

module.exports = new SnippetsManager();