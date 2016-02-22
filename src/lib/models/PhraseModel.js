'use strict';

var _ = require('lodash');

var PhraseModel = function(json, domain, compiled){
  this.json = _.cloneDeep(json); //Clone to avoid modifications on parent object
  this.id = json.id ? json.id : this._generateId(domain);
  this.compiled = compiled;
};

PhraseModel.prototype.getId = function() {
  return this.id;
};

PhraseModel.prototype._generateId = function(domain) {
  return domain + '!' + this.json.url.replace(/\//g, '!');
};

PhraseModel.prototype.getRawModel = function(){
  return this.json;
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