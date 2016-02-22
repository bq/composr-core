'use strict';

var _ = require('lodash');
var regexpGenerator = require('../regexpGenerator');
var paramsExtractor = require('../paramsExtractor');
var XRegExp = require('xregexp').XRegExp;
var utils = require('../utils.js');
var evaluateCode = require('../compilers/evaluateCode');
var methods = ['get', 'put', 'post', 'delete', 'options'];
var DEFAULT_PHRASE_PARAMETERS = [
  'req', 
  'res', 
  'next', 
  'corbelDriver', 
  'domain', 
  'require', 
  'config', 
  'metrics'
  ];

var PhraseModel = function(json, domain){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id ? json.id : this._generateId(domain);

  //The regexp reference dictaminates the routing mechanisms
  this.regexpReference = regexpGenerator.regexpReference(this.getUrl());

  this.compiled = {
    codes : {}
  };
};

PhraseModel.prototype._generateId = function(domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

PhraseModel.prototype.getId = function() {
  return this.id;
};

PhraseModel.prototype.getUrl = function() {
  return this.json.url;
};

PhraseModel.prototype.getRegexp = function(){
  return this.getRegexpReference().regexp;
};

PhraseModel.prototype.getRegexpReference = function(){
  return this.regexpReference;
};

PhraseModel.prototype.getRawModel = function(){
  return this.json;
};

PhraseModel.prototype.canRun = function(verb){
  return this.compiled.codes[verb] && this.compiled.codes[verb].error === false;
};

PhraseModel.prototype.matchesPath = function(path){
  return XRegExp.test(path, this.getRegexp());
};

/*
 Asume that the path is sanitized without query params.
 */
PhraseModel.prototype.extractParamsFromPath = function(path){
  return paramsExtractor.extract(path, this.getRegexpReference());
};

PhraseModel.prototype.compile = function(events){
  var model = this;

  this.compiled.codes = {};

  //Create in memory functions with the evaluation of the codes
  methods.forEach(function(method) {
    if (model.json[method] && (model.json[method].code || model.json[method].codehash)) {
      //@TODO: emit events for the evaluation of the codes
      events.emit('debug', 'phrase:evaluatecode:', method, model.getId());
      
      var code;

      if (model.json[method].codehash) {
        code = utils.decodeFromBase64(model.json[method].codehash);
      } else {
        code = model.json[method].code;
      }

      var debugInfo = model.json.debug ? model.json.debug[method] : null;

      model.compiled.codes[method] = evaluateCode(code, DEFAULT_PHRASE_PARAMETERS, debugInfo, function(err){
        if(err){
          events.emit('debug', model.getId() + ':evaluatecode:good');
        }else{
          events.emit('warn', model.getId() + ':evaluatecode:wrong_code', err);
        }
      });
    }
  });
};

//Runs VM script mode
PhraseModel.prototype.__executeScriptMode = function(verb, parameters, timeout, file) {

  var options = {
    timeout: timeout || 10000,
    displayErrors: true
  };

  if (file) {
    options.filename = file;
  }

  this.compiled.codes[verb].script.runInNewContext(parameters, options);
};

//Runs function mode (DEPRECATED)
PhraseModel.prototype.__executeFunctionMode = function(verb, parameters, timeout, file) {
  //@TODO: configure timeout
  //@TODO: enable VM if memory bug gets solved
  if (file) {
    var fn = require(file);
    fn(
      parameters.req,
      parameters.res,
      parameters.next,
      parameters.corbelDriver,
      parameters.domain,
      parameters.require,
      parameters.config,
      parameters.metrics
    );
  } else {
    this.compiled.codes[verb].fn.apply(null, [parameters.req,
      parameters.res,
      parameters.next,
      parameters.corbelDriver,
      parameters.domain,
      parameters.require,
      parameters.config,
      parameters.metrics
    ]);
  }
};

module.exports = PhraseModel;