'use strict';
var phraseValidator = require('../validators/phrase.validator');
var PhraseModel = require('../models/PhraseModel');
var BaseManager = require('./base.manager');
var queryString = require('query-string');
var ComposrError = require('../ComposrError');
var MetricsFirer = require('../MetricsFirer');
var parseToComposrError = require('../parseToComposrError');
var mockedServer = require('../mock');
var utils = require('../utils');

var _ = require('lodash');

var PhraseManager = function(options) {
  this.events = options.events;
  this.requirer = options.requirer;
  this.config = options.config || {};
};

PhraseManager.prototype = new BaseManager({
  itemName: 'phrase',
  item: '__phrases',
  validator: phraseValidator
});

PhraseManager.prototype.configure = function(config){
  this.config = {
    urlBase : config.urlBase
  };
};

PhraseManager.prototype.__preCompile = function(domain, phrase) {
  var phraseId = this._generateId(phrase.url, domain);

  if (!phrase.id) {
    phrase.id = phraseId;
  }
};

PhraseManager.prototype.__preAdd = function(domain, phraseModel) {
  var phrasesWithTheSamePath = this._filterByRegexp(domain, phraseModel.getRegexp());

  if (phrasesWithTheSamePath.length > 0) {
    this.events.emit('warn', 'phrase:path:duplicated', phraseModel.getId());
  }
};

//Modifies the internal __phrases list
PhraseManager.prototype._addToList = function(domain, phraseCompiled) {
  if (!domain || !phraseCompiled) {
    return false;
  }

  if (typeof(phraseCompiled) !== 'object' || !phraseCompiled.getId()) {
    return false;
  }

  if (!this.__phrases[domain]) {
    this.__phrases[domain] = [];
  }

  var index = this._getPhraseIndexById(domain, phraseCompiled.getId());

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

PhraseManager.prototype._compile = function(domain, phrase) {
  try {

    var phraseModel = new PhraseModel(phrase, domain);
    
    phraseModel.compile(this.events);

    this.events.emit('debug', 'phrase:compiled', phraseModel.getId(), Object.keys(phraseModel.compiled.codes));

    return phraseModel;

  } catch (e) {
    //Somehow it has tried to compile an invalid phrase. Notify it and return false.
    //Catching errors and returning false here is important for not having an unstable phrases stack.
    this.events.emit('errore', 'phrase:not:usable', phrase.url, e);
    return false;
  }

};

//Executes a phrase by id
PhraseManager.prototype.runById = function(domain, id, verb, params) {
  if (utils.values.isFalsy(verb)) {
    verb = 'get';
  }

  var phrase = this.getById(domain, id);

  if (phrase && phrase.canRun(verb)) {
    return this._run(phrase, verb, params, domain);
  } else {
    //@TODO: See if we want to return that error directly or a wrappedResponse with 404 status (or invalid VERB)
    return Promise.reject('phrase:cant:be:runned');
  }
};

//Executes a phrase matching a path
PhraseManager.prototype.runByPath = function(domain, path, verb, params) {
  if (utils.values.isFalsy(verb)) {
    verb = 'get';
  }

  var phrase = this.getByMatchingPath(domain, path, verb);

  if (phrase && phrase.canRun(verb)) {
    if (!params) {
      params = {};
    }

    var queryParamsString = '';

    if (!params.query && !(params.req && params.req.query && Object.keys(params.req.query).length > 0)) {
      //If no reqQuery object or req.querty params are sent, extract them
      queryParamsString = path.indexOf('?') !== -1 ? path.substring(path.indexOf('?'), path.length) : '';
      params.query = queryString.parse(queryParamsString);
    }

    if (!params.params) {
      //extract params from path
      var sanitizedPath = path.replace(queryParamsString, '');
      params.params = phrase.getParamsFromPath(sanitizedPath);
    }

    return this._run(phrase, verb, params, domain);
  } else {
    //@TODO: See if we want to return that error directly or a wrappedResponse with 404 status (or invalid VERB)
    return Promise.reject('phrase:cant:be:runned');
  }

};

/*
  Fills the sandbox with parameters
 */
function buildSandbox(sb, options, urlBase, domain, requirer, reqWrapper, resWrapper, nextWrapper){
  sb.console = console;
  sb.Promise = Promise;

  sb.req = reqWrapper;

  sb.res = resWrapper;

  sb.next = nextWrapper.resolve;

  if (!options.corbelDriver) {
    sb.corbelDriver = null;
  } else {
    sb.corbelDriver = options.corbelDriver;
  }

  sb.domain = domain;

  sb.require = options.browser ? requirer.forDomain(domain, true) : requirer.forDomain(domain);
  
  sb.config = {};

  sb.config.urlBase = urlBase;

  sb.metrics = new MetricsFirer(domain);
}

//Executes a phrase
PhraseManager.prototype._run = function(phrase, verb, params, domain) {
  this.events.emit('debug', 'running:phrase:' + phrase.id + ':' + verb);
  
  if (!params) {
    params = {};
  }

  var urlBase = params.config && params.config.urlBase ? params.config.urlBase : this.config.urlBase;

  var resWrapper = mockedServer.res(params.server, params.res);
  var reqWrapper = mockedServer.req(params.server, params.req, params);
  var nextWrapper = mockedServer.next(params.next);
  var sandbox = {};

  //Fill the sandbox params
  buildSandbox(sandbox, params, urlBase, domain, this.requirer, reqWrapper, resWrapper, nextWrapper);
  
  //trigger the execution 
  try {
    if (params.browser) {
      phrase.__executeFunctionMode(verb, sandbox, params.timeout, params.file);
    } else {
      phrase.__executeScriptMode(verb, sandbox, params.timeout, params.file);
    }
  } catch (e) {
    //@TODO this errors can be: 
    //- corbel errors
    //- Any thrown error in phrase
    // How do we handle it?
    if (params.browser) {
      //Function mode only throws an error when errored
      this.events.emit('warn', 'phrase:internal:error', e, phrase.getUrl());

      var error = parseToComposrError(e, 'error:phrase:exception:' + phrase.getUrl());

      resWrapper.status(error.status).send(error);
    } else {
      //vm throws an error when timedout
      this.events.emit('warn', 'phrase:timedout', e, phrase.getUrl());
      resWrapper.status(503).send(new ComposrError('error:phrase:timedout:' + phrase.getUrl(), 'The phrase endpoint is timing out', 503));
    }
  }

  //Resolve on any promise resolution or rejection, either res or next
  return Promise.race([resWrapper.promise, nextWrapper.promise]);

};


//Returns a list of elements matching the same regexp
PhraseManager.prototype._filterByRegexp = function(domain, regexp) {
  var candidates = this._getPhrasesAsList(domain);

  return _.filter(candidates, function(candidate) {
    return candidate.getRegexp() === regexp;
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
    if (candidates[i].getId() === id) {
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
    if (phrase.canRun(verb) && phrase.matchesPath(path)) {
      return phrase;
    }
  }));

  this.events.emit('debug', 'found:' + candidates.length + ':candidates');

  if (candidates.length === 0) {
    this.events.emit('debug', 'notfound:candidates:path:' + path + ':' + verb);
    return candidate;
  } else {
    candidate = candidates[0];
    this.events.emit('debug', 'using:candidate:' + candidate.getId() + ':' + verb);
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