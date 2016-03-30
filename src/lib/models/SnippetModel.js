'use strict';

var _ = require('lodash');
var BaseModel = require('./BaseModel');
var utils = require('../utils.js');
var evaluateCode = require('../compilers/evaluateCode');
var DEFAULT_SNIPPET_PARAMETERS = ['exports'];

var SnippetModel = function(json, domain){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object

  this.id = this._generateId(domain);
  this.domain = domain;

  //Stores the id on the raw model
  this.json.id = this.id;
  
  this.compiled = {
    code : null
  };
};

SnippetModel.prototype = new BaseModel();

SnippetModel.prototype.getName = function() {
  return this.json.name;
};

SnippetModel.prototype.compile = function(events){
  var model = this;
  var code = utils.decodeFromBase64(this.json.codehash);
  
  var codeCompiled = evaluateCode(code, DEFAULT_SNIPPET_PARAMETERS, null);
  
  if (codeCompiled.error){
    events.emit('warn', model.getId() + ':evaluatecode:wrong_code', codeCompiled.error);
  }else{
    events.emit('debug', model.getId() + ':evaluatecode:good');
  }
  
  this.compiled.code = codeCompiled;
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