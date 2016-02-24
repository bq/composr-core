'use strict';

var _ = require('lodash');
var utils = require('../utils.js');
var evaluateCode = require('../compilers/evaluateCode');
var DEFAULT_SNIPPET_PARAMETERS = ['exports'];

var SnippetModel = function(json, domain){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id;
  this.name = this.id.replace(domain + '!', '');
  this.compiled = {
    code : null
  };
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

PhraseModel.prototype.getMD5 = function() {
  return this.json.md5;
};

SnippetModel.prototype.compile = function(events){
  var model = this;
  var code = utils.decodeFromBase64(this.json.codehash);
  this.compiled.code = evaluateCode(code, DEFAULT_SNIPPET_PARAMETERS, null, function(err){
    if(err){
      events.emit('debug', model.getId() + ':evaluatecode:good');
    }else{
      events.emit('warn', model.getId() + ':evaluatecode:wrong_code', err);
    }
  });
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