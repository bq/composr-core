'use strict';
var phraseValidator = require('./validators/phrase.validator');
var CodeCompiler = require('./compilers/code.compiler');
var regexpGenerator = require('./regexpGenerator');
var paramsExtractor = require('./paramsExtractor');
var ComposrError = require('./ComposrError');
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

        if (phrase[method].codehash) {
          code = utils.decodeFromBase64(phrase[method].codehash);
        } else {
          code = phrase[method].code;
        }

        compiled.codes[method] = module._evaluateCode(code, DEFAULT_PHRASE_PARAMETERS);
      }
    });

    module.events.emit('debug', 'phrase:compiled', compiled.id, Object.keys(compiled.codes));

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
    if (!params) {
      params = {};
    }

    if (!params.reqParams) {
      //extract params from path
      params.reqParams = paramsExtractor.extract(path, phrase.regexpReference);
    }

    return this._run(phrase, verb, params, domain);
  } else {
    return q.reject('phrase:cant:be:runned');
  }

};

//Checks if it can be run
PhraseManager.prototype.canBeRun = function(phrase, verb) {
  if (phrase && phrase.codes[verb] && phrase.codes[verb].error === false) {
    return true;
  } else {
    return false;
  }
};

//Executes a phrase
PhraseManager.prototype._run = function(phrase, verb, params, domain) {
  this.events.emit('debug', 'running:phrase:' + phrase.id + ':' + verb);


  var callerParameters = {};

  var resWrapper = mockedExpress.res(params ? params.res : null);
  var nextWrapper = mockedExpress.next();

  if (!params) {
    params = {};
  }

  if (!params.req) {
    var reqParams = {};

    if (params.reqHeaders) {
      reqParams.headers = params.reqHeaders;
    }

    if (params.reqBody) {
      reqParams.body = params.reqBody;
    }

    if (params.reqParams) {
      reqParams.params = params.reqParams;
    }

    callerParameters.req = mockedExpress.req(reqParams);
  } else {
    //Overwrite params extraction
    if (params.reqParams) {
      params.req.params = params.reqParams;
    }

    callerParameters.req = params.req;
  }

  if (params.res) {
    var previousRes = params.res;

    resWrapper.promise.then(function(response) {
      return previousRes.status(response.status)[resWrapper._action](response.body);
    }).catch(function(errResponse) {
      return previousRes.status(errResponse.status)[resWrapper._action](errResponse.body);
    });
  }

  callerParameters.res = resWrapper;

  if (params.next) {
    var previousNext = params.next;
    nextWrapper.promise.then(function() {
      previousNext();
    });
  }

  callerParameters.next = nextWrapper.resolve;

  if (!params.corbelDriver) {
    callerParameters.corbelDriver = null;
  } else {
    callerParameters.corbelDriver = params.corbelDriver;
  }

  callerParameters.domain = domain;

  callerParameters.require = this.requirer.forDomain(domain);

  //trigger the execution 
  try {

    if (params.browser) {

      var phraseCode = phrase.codes[verb].fn;
      this.__executeFunctionMode(phraseCode, callerParameters, params.timeout);
    } else {
      var phraseScript = phrase.codes[verb].script;
      this.__executeScriptMode(phraseScript, callerParameters, params.timeout);
    }

  } catch (e) {
    //vm throws an error when timedout
    this.events.emit('warn', 'phrase:timedout', phrase.url, e);
    resWrapper.status(503).send(new ComposrError('error:phrase:timedout:' + phrase.url, 'The phrase endpoint is timing out', 503));
  }

  //Resolve on any promise resolution or rejection, either res or next
  return Promise.race([resWrapper.promise, nextWrapper.promise]);

};

//Runs VM script mode
PhraseManager.prototype.__executeScriptMode = function(script, parameters, timeout) {
  script.runInNewContext(parameters, {
    timeout: timeout || 10000
  });
};

//Runs VM function mode (DEPRECATED)
PhraseManager.prototype.__executeFunctionMode = function(code, parameters) {
  code.apply(null, _.values(parameters));
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