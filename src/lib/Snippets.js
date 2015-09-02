'use strict';
var CodeCompiler = require('./compilers/code.compiler.js');
var snippetValidator = require('./validators/snippet.validator.js');
//var utils = require('./utils');

//var q = require('q');
//var _ = require('lodash');

var SnippetsManager = function() {
};

SnippetsManager.prototype = new CodeCompiler({
  itemName : 'snippet',
  item : '__snippets',
  validator : snippetValidator
});

//Compilation
SnippetsManager.prototype._compile = function(item) {
  //Implement freely
  return item;
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
SnippetsManager.prototype.getById = function(domain, id){
  var snippets = this.getSnippets(domain);

  if(snippets){
    return snippets[id];
  }else{
    return null;
  }
};

module.exports = new SnippetsManager();