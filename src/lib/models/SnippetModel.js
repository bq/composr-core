'use strict';

var _ = require('lodash');
var utils = require('../utils.js');
var evaluateCode = require('../compilers/evaluateCode');
var DEFAULT_SNIPPET_PARAMETERS = ['exports'];

var SnippetModel = function(json, domain){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id ? json.id : this._generateId(domain);
  this.name = this.id.replace(domain + '!', '');
  this.compiled = {
    code : null
  };
};

SnippetModel.prototype._generateId = function(domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

SnippetModel.prototype.getId = function() {
  return this.id;
};

SnippetModel.prototype.getName = function() {
  return this.name;
};

SnippetModel.prototype.getRawModel = function(){
  return this.json;
};

SnippetModel.prototype.compile = function(events){
  var code = utils.decodeFromBase64(this.json.codehash);
  this.compiled.code = evaluateCode(code, DEFAULT_SNIPPET_PARAMETERS, null, events, this.getId());
};

SnippetModel.prototype.execute = function(functionMode, cb) {
  if(functionMode){
    this.compiled.code.fn(function(res) {
      cb(res);
    });
  }else{
    this.compiled.code.script.runInNewContext({
      exports: function(res) {
        cb(res);
      }
    });
  }
};

module.exports = SnippetModel;