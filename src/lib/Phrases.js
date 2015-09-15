'use strict';
var phraseValidator = require('./validators/phrase.validator');
var CodeCompiler = require('./compilers/code.compiler');
var regexpGenerator = require('./regexpGenerator');
var mockedExpress = require('./mock');
var utils = require('./utils');

var q = require('q');
var _ = require('lodash');
var XRegExp = require('xregexp').XRegExp;

var DEFAULT_PHRASE_PARAMETERS = ['req', 'res', 'next', 'corbelDriver', 'domain', 'require'];


var PhraseManager = function(options) {
  this.events = options.events;
  this.requirer = options.requirer;
};

PhraseManager.prototype = new CodeCompiler({
  itemName: 'phrase',
  item: '__phrases',
  validator: phraseValidator
});

PhraseManager.prototype.__preCompile = function(domain, phrase) {
  var phraseId = this._generateId(phrase.url, domain);

  if (!phrase.id) {
    phrase.id = phraseId;
  }
};

PhraseManager.prototype.__preAdd = function(domain, compiled) {
  var phrasesWithTheSamePath = this._filterByRegexp(domain, compiled.regexpReference.regexp);

  if (phrasesWithTheSamePath.length > 0) {
    this.events.emit('warn', 'phrase:path:duplicated', compiled.id);
  }
};

//Modifies the internal __phrases list
PhraseManager.prototype._addToList = function(domain, phraseCompiled) {
  if (!domain || !phraseCompiled) {
    return false;
  }

  if (typeof(phraseCompiled) !== 'object' || phraseCompiled.hasOwnProperty('id') === false || !phraseCompiled.id) {
    return false;
  }

  if (!this.__phrases[domain]) {
    this.__phrases[domain] = [];
  }

  var index = this._getPhraseIndexById(domain, phraseCompiled.id);

  if (index === -1) {
    this.__phrases[domain].push(phraseCompiled);
  } else {
    this.__phrases[domain][index] = phraseCompiled;
  }

  return true;
};

//Removes phrases from memory
PhraseManager.prototype._unregister = function(domain, id) {
  var index = this._getPhraseIndexById(domain, id);
  if (index !== -1) {
    this.__phrases[domain].splice(index, 1);
  }
};

PhraseManager.prototype._compile = function(phrase) {
  try {
    var module = this;

    var compiled = {};

    compiled.url = phrase.url;
    compiled.id = phrase.id;
    //The regexp reference dictaminates the routing mechanisms
    compiled.regexpReference = regexpGenerator.regexpReference(phrase.url);

    var methods = ['get', 'put', 'post', 'delete', 'options'];

    compiled.codes = {};

    //Create in memory functions with the evaluation of the codes
    methods.forEach(function(method) {
      if (phrase[method] && (phrase[method].code || phrase[method].codehash)) {
        var phraseIdentifier = phrase.id ? phrase.id : phrase.url;
        module.events.emit('debug', 'phrase_manager:evaluatecode:', method, phraseIdentifier);

        var code;

        if(phrase[method].codehash){
          code = new Buffer(phrase[method].codehash, 'base64').toString('utf8');
        }else{
          code = phrase[method].code;
        }
        
        compiled.codes[method] = module._evaluateCode(code, DEFAULT_PHRASE_PARAMETERS);
      }
    });

    module.events.emit('debug', 'phrase:compiled', compiled);

    return compiled;

  } catch (e) {
    //Somehow it has tried to compile an invalid phrase. Notify it and return false.
    //Catching errors and returning false here is important for not having an unstable phrases stack.
    this.events.emit('error', 'phrase:not:usable', phrase.url, e);
    return false;
  }

};

//Executes a phrase by id
PhraseManager.prototype.runById = function(domain, id, verb, params) {
  if (utils.values.isFalsy(verb)) {
    verb = 'get';
  }

  var phrase = this.getById(domain, id);

  if (this.canBeRun(phrase, verb)) {
    return this._run(phrase, verb, params, domain);
  } else {
    return q.reject('phrase:cant:be:runned');
  }

};

//Executes a phrase matching a path
PhraseManager.prototype.runByPath = function(domain, path, verb, params) {
  if (utils.values.isFalsy(verb)) {
    verb = 'get';
  }

  var phrase = this.getByMatchingPath(domain, path, verb);

  if (this.canBeRun(phrase, verb)) {
    return this._run(phrase, verb, params, domain);
  } else {
    return q.reject('phrase:cant:be:runned');
  }

};

//Checks if it can be run
PhraseManager.prototype.canBeRun = function(phrase, verb){
  if (phrase && phrase.codes[verb] && phrase.codes[verb].error === false){
    return true;
  }else{
    return false;
  }
};

//Executes a phrase
PhraseManager.prototype._run = function(phrase, verb, params, domain) {
  this.events.emit('debug', 'running:phrase:' + phrase.id + ':' + verb);

  var phraseCode = phrase.codes[verb].fn;
  var callerParameters = {};

  var resWrapper = mockedExpress.res();
  var nextWrapper = mockedExpress.next();

  if (!params) {
    params = {};
  }

  if(!params.req){
    callerParameters.req = mockedExpress.req();
  }else{
    callerParameters.req = params.req;
  }

  if(!params.res){
    callerParameters.res = resWrapper;
  }else{
    var previousRes = params.res;
    callerParameters.res = resWrapper;
    resWrapper.promise.then(function(response){
      return previousRes.status(response.status)[resWrapper._action](response.body);
    });
  }

  if(!params.next){
    callerParameters.next = nextWrapper;
  }else{
    var previousNext = params.next;
    callerParameters.next = nextWrapper;
    nextWrapper.promise.then(function(){
      previousNext();
    });
  }

  if(!params.corbelDriver){
    callerParameters.corbelDriver = null;
  }else{
    callerParameters.corbelDriver = params.corbelDriver;
  }

  callerParameters.domain = domain;

  callerParameters.require = this.requirer.forDomain(domain);

  //trigger the execution 
  //TODO: use VM or try / catch it
  //TODO: tripwire for timeouts
  phraseCode.apply(null, _.values(callerParameters));

  //Resolve on any promise resolution, either res or next
  return q.any([resWrapper.promise, nextWrapper.promise]);
};

//Returns a list of elements matching the same regexp
PhraseManager.prototype._filterByRegexp = function(domain, regexp) {
  var candidates = this._getPhrasesAsList(domain);

  return _.filter(candidates, function(candidate) {
    return candidate.regexpReference.regexp === regexp;
  });
};

//Flattens all the phrases in a single list array 
PhraseManager.prototype._getPhrasesAsList = function(domain) {
  var list = [];
  var module = this;

  if (utils.values.isFalsy(domain)) {
    list = _.flatten(Object.keys(this.__phrases).map(function(key) {
      return module.__phrases[key];
    }));
  } else if (this.__phrases[domain]) {
    list = this.__phrases[domain];
  }

  return list;
};

//Returns one phrase matching the id
PhraseManager.prototype.getById = function(domain, id) {
  var candidates = this._getPhrasesAsList(domain);
  var index = this._getPhraseIndexById(domain, id);

  return index !== -1 ? candidates[index] : null;
};

//Returns the index of a phrase that matches by id
PhraseManager.prototype._getPhraseIndexById = function(domain, id) {
  var candidates = this._getPhrasesAsList(domain);
  var index = -1;

  for (var i = 0; i < candidates.length; i++) {
    if (candidates[i].id === id) {
      index = i;
      break;
    }
  }

  return index;
};

//Get all the phrases, or all the phrases for one domain
PhraseManager.prototype.getPhrases = function(domain) {
  if (!domain) {
    return this._getPhrasesAsList();
  }

  return this.__phrases[domain] ? this.__phrases[domain] : null;
};

/** 
      CORE Entry point. One of the purposes of composr-core is to provide a fast and reliable
      getByMatchingPath method.
     **/
PhraseManager.prototype.getByMatchingPath = function(domain, path, verb) {
  var candidate = null;

  if (!verb) {
    verb = 'get';
  }

  domain = utils.values.isFalsy(domain) ? null : domain;

  this.events.emit('debug', 'phrase:getByMatchingPath:' + domain + ':' + path + ':' + verb);

  if (utils.values.isFalsy(path)) {
    this.events.emit('error', 'phrase:getByMatchingPath:path:undefined');
    return candidate;
  }

  var queryParamsString = path.indexOf('?') !== -1 ? path.substring(path.indexOf('?'), path.length) : '';

  path = path.replace(queryParamsString, '');

  if (domain === null) {
    this.events.emit('warn', 'phrase:getByMatchingPath:noDomain:matchingAgainstAll:expensiveMethod');
  }

  var candidates = this._getPhrasesAsList(domain);

  this.events.emit('debug', 'evaluating:' + candidates.length + ':candidates');

  candidates = _.compact(candidates.map(function(phrase) {
    if (phrase.codes[verb] &&
      XRegExp.test(path, phrase.regexpReference.xregexp)) {
      return phrase;
    }
  }));

  this.events.emit('debug', 'found:' + candidates.length + ':candidates');

  if (candidates.length === 0) {
    this.events.emit('debug', 'notfound:candidates:path:' + path + ':' + verb);
    return candidate;
  } else {
    candidate = candidates[0];
    this.events.emit('debug', 'using:candidate:' + candidate.id + ':' + verb);
    return candidate;
  }

};

//Counts all the loaded phrases
PhraseManager.prototype.count = function() {
  return this._getPhrasesAsList().length;
};

//Generates a PhraseID from a url an a domain
PhraseManager.prototype._generateId = function(url, domain) {
  return domain + '!' + url.replace(/\//g, '!');
};


module.exports = PhraseManager;