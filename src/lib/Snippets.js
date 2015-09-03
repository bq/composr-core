'use strict';
var CodeCompiler = require('./compilers/code.compiler.js');
var snippetValidator = require('./validators/snippet.validator.js');

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
      name: snippet.id.replace(this._extractDomainFromId(snippet.id) + '!', ''),
      code: null
    };

    compiled.code = this._evaluateCode(snippet.code, ['exports']);

    this.events.emit('debug', 'snippet:compiled', compiled);

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

  if (typeof(snippetCompiled) !== 'object' || snippetCompiled.hasOwnProperty('name') === false || !snippetCompiled.name) {
    return false;
  }

  if (!this.__snippets[domain]) {
    this.__snippets[domain] = {};
  }

  this.__snippets[domain][snippetCompiled.name] = snippetCompiled;
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
    return snippets[id] ? snippets[id] : null;
  } else {
    return null;
  }
};

module.exports = new SnippetsManager();