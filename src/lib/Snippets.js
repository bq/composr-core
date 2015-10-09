'use strict';
var CodeCompiler = require('./compilers/code.compiler.js');
var snippetValidator = require('./validators/snippet.validator.js');
var utils = require('./utils.js');

var SnippetsManager = function(options) {
  this.events = options.events;
};

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
      name: snippet.id.replace(this._extractDomainFromId(snippet.id) + '!', ''),
      code: null
    };

    var code = utils.decodeFromBase64(snippet.codehash);

    compiled.code = this._evaluateCode(code, ['exports']);

    this.events.emit('debug', 'snippet:compiled', compiled.id, compiled.name);

    return compiled;

  } catch (e) {
    console.log(e);
    //Somehow it has tried to compile an invalid snippet. Notify it and return false.
    //Catching errors and returning false here is important for not having an unstable snippets stack.
    this.events.emit('error', 'snippet:not:usable', snippet.id, e);
    return false;
  }

};

SnippetsManager.prototype._addToList = function(domain, snippetCompiled) {
  if (!domain || !snippetCompiled) {
    return false;
  }

  if (typeof(snippetCompiled) !== 'object' || snippetCompiled.hasOwnProperty('id') === false || !snippetCompiled.id) {
    return false;
  }

  if (!this.__snippets[domain]) {
    this.__snippets[domain] = {};
  }

  this.__snippets[domain][snippetCompiled.id] = snippetCompiled;
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
SnippetsManager.prototype.getByName = function(domain, id) {
  var snippets = this.getSnippets(domain);

  if (snippets) {
    return snippets[domain + '!' + id] ? snippets[domain + '!' + id] : null;
  } else {
    return null;
  }
};

module.exports = SnippetsManager;