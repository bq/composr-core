'use strict';

var validate = require('./validate'),
  corbel = require('corbel-js'),
  regexpGenerator = require('./regexpGenerator'),
  paramsExtractor = require('./paramsExtractor'),
  compoSRBuilder = require('./compoSRBuilder'),
  tripwire = require('tripwire'),
  request = require('request'),
  XRegExp = require('xregexp').XRegExp,
  _ = require('lodash'),
  q = require('q'),
  ComposrError = require('./ComposrError');


/**********************************
  Utils
**********************************/
function countPhrases() {
  /*jshint validthis:true */
  return Object.keys(this.list).reduce(function(prev, next) {
    var domainPhrasesLength = Object.keys(this.list[next]).length;
    return prev + domainPhrasesLength;
  }, 0);
}


/**********************************
  Phrase Manager
**********************************/

var PhraseManager = function() {
  this.cached = {};
  this.list = {};
};

PhraseManager.prototype.executePhrase = function executePhrase(context, compoSR, phraseFunction) {

  // set the limit of execution time to 10000 milliseconds
  tripwire.resetTripwire(this.config('timeout') || 10000);

  phraseFunction.apply(null, _.values(context).concat(compoSR));

  // clear the tripwire (in this case this code is never reached)
  var ctx = {
    timedout: true
  };
  tripwire.clearTripwire(ctx);

};


PhraseManager.prototype.evaluateCode = function evaluePhrase(phraseBody, params) {
  var phraseParams = params ? params : ['req', 'res', 'next', 'corbelDriver', 'corbel', 'ComposrError', 'domain', '_', 'q', 'request', 'compoSR'];
  var result = {
    fn: null,
    error: false
  };

  try {
    /* jshint evil:true */
    result.fn = Function.apply(null, phraseParams.concat(phraseBody));
  } catch (e) {
    this._logger.warn('phrase_manager:evaluatecode:wrong_code', e);
    //TODO: emit event pmx.notify('phrase_manager:evaluatecode:wrong_code');
    result.error = true;
  }

  return result;
};

PhraseManager.prototype.cacheMethods = function cacheMethods(phrase) {

  var methods = ['get', 'put', 'post', 'delete'];

  phrase.codes = {};

  methods.forEach(function(method) {
    if (phrase[method] && (phrase[method].code || phrase[method].codehash)) {
      this._logger.debug('phrase_manager:evaluatecode:', method, phrase.id);
      var code = phrase[method].code ? phrase[method].code : new Buffer(phrase[method].codehash, 'base64').toString('utf8');
      phrase.codes[method] = this.evaluateCode(code);
    }
  }.bind(this));
};

/**
 * Returns index of phrase in a specific domain that matches phraseId, -1 if not found
 * @param  {String} domain
 * @param  {String} phraseId
 * @return {Number}
 */
PhraseManager.prototype.getPhraseIndexById = function getPhraseIndexById(domain, phraseId) {
  validate.isValue(domain, 'undefined:domain');
  validate.isValue(phraseId, 'undefined:phraseId');

  return _.findIndex(this.getPhrases(domain), function(item) {
    return item.id === phraseId;
  });
};

/**
 * Returns a phrase in a specific domain that matches path, null if not found
 * @example
 * phrase.url = 'your/phrase/name/:param1?';
 * path = 'your/phrase/name'
 * @param  {String} domain
 * @param  {String} path
 * @return {Object}
 */
PhraseManager.prototype.getPhraseByMatchingPath = function(domain, path) {
  validate.isValue(domain, 'undefined:domain');
  validate.isValue(path, 'undefined:path');

  var queryParamsString = path.indexOf('?') !== -1 ? path.substring(path.indexOf('?'), path.length) : '';

  path = path.replace(queryParamsString, '');

  this._logger.debug('phrase_manager:get_phrase:', path);

  var domainPhrases = this.getPhrases(domain);

  if (!domainPhrases || domainPhrases.length === 0) {
    this._logger.debug('phrase_manager:get_phrase:no_phrases');
    return null;
  }

  var candidates = _.filter(domainPhrases, function(phrase) {
    var regexp = XRegExp(phrase.regexpReference.regexp); //jshint ignore:line

    return XRegExp.test(path, regexp);
  });

  this._logger.debug('phrase_manager:get_phrase_by_name:candidates', candidates.length);

  return candidates.length > 0 ? candidates[0] : null;
};

/**
 * Registers a phrase on the phrases hashmap
 * @param  {object} phrase
 */
PhraseManager.prototype.registerPhrase = function registerPhrase(phrase) {

  validate.isValue(phrase, 'undefined:phrase');

  var domain = phrase.id.split('!')[0];
  this.list[domain] = this.list[domain] || [];

  var exists = this.getPhraseIndexById(domain, phrase.id);

  //Construct the regexpression reference for the url
  phrase.regexpReference = regexpGenerator.regexpReference(phrase.url);

  //Cache methods 
  this.cacheMethods(phrase);

  if (exists !== -1) {
    this._logger.debug('phrase_manager:register_phrase:update', domain);
    this.list[domain][exists] = phrase;
  } else {
    this._logger.debug('phrase_manager:register_phrase:add', domain);
    this.list[domain].push(phrase);
  }
};

PhraseManager.prototype.unregisterPhrase = function unregisterPhrase(phrase) {

  validate.isValue(phrase, 'undefined:phrase');
  validate.isValue(phrase.id, 'undefined:phrase:id');

  var domain = phrase.id.split('!')[0];
  var url = '/' + phrase.id.replace(/!/g, '/');

  this._logger.debug('phrase_manager:unregister_phrase', domain, url);

  // remove from internal data
  var exists = this.getPhraseIndexById(domain, phrase.id);

  if (exists !== -1) {
    this.list[domain].splice(exists, 1);
  }
};

PhraseManager.prototype.getPhrases = function getPhrases(domain) {
  this._logger.debug('phrase_manager:get_phrases:domain', domain);
  return this.list[domain];
};

PhraseManager.prototype.run = function run(domain, phrasePath, req, res, next) {

  this._logger.debug('phrase_manager:run', domain, phrasePath, req.params);

  validate.isValue(domain, 'undefined:domain');
  validate.isValue(phrasePath, 'undefined:phrasePath');

  this.list[domain] = this.list[domain] || [];

  var phrase = this.getPhraseByMatchingPath(domain, phrasePath);

  this._logger.debug('phrase_manager:phrases:length', this.list[domain].length);
  this._logger.debug('phrase_manager:exists', (phrase ? phrase.url : null));
  if (!this.list[domain] || !phrase) {
    this._logger.debug('phrase_manager:not_found');
    return next();
  }

  var method = req.method.toLowerCase();

  this._logger.debug('phrase_manager:method', method);
  this._logger.debug('phrase_manager:phrase.method:exist', !!phrase[method]);
  if (!phrase[method]) {
    this._logger.debug('phrase_manager:not_found');
    return next();
  }

  var existsCode = (phrase[method].code && phrase[method].code.length > 0) || (phrase[method].codehash && phrase[method].codehash.length > 0);
  this._logger.debug('phrase_manager:phrase.code:exist', existsCode);
  if (!existsCode) {
    this._logger.debug('phrase_manager:code:not_found');
    return next();
  }

  var driverObtainFunction = function(defaults) {
    return function(options) {
      this._logger.debug(defaults, '-----', options);
      var generatedOptions = _.defaults(_.cloneDeep(options), defaults);
      this._logger.debug('phrase_manager:corbel.generateDriver', generatedOptions);
      return corbel.getDriver(generatedOptions);
    };
  };

  corbel.generateDriver = driverObtainFunction(this.config['corbel.driver.options']);

  var corbelDriver = null;
  //If token is present, pregenerate a corbelDriver, otherwise let them manage the corbelDriver instantiation
  if (req.get('Authorization')) {
    this._logger.debug('phrase_manager:corbel_driver:iam_token');
    var iamToken = {
      'accessToken': req.get('Authorization').replace('Bearer ', '')
    };
    corbelDriver = corbel.generateDriver({
      iamToken: iamToken
    });
  }

  //Emit phrase executed metric
  /*pmx.emit('phrase_executed', {
    phraseId: phrase.id
  });
  TODO: Emit event
*/

  //Assign params
  req.params = paramsExtractor.extract(phrasePath, phrase.regexpReference);

  var context = {
    req: req,
    res: res,
    next: next,
    corbelDriver: corbelDriver,
    corbel: corbel,
    ComposrError: ComposrError,
    domain: domain,
    _: _,
    q: q,
    request: request
  };
  //We have left compoSR alone, without including it in the context because someday we might
  //want to have compoSR use the context for binding req, res... to the snippets
  var compoSR = compoSRBuilder.getCompoSR(domain);

  this.executePhrase(context, compoSR, phrase.codes[method].fn);

};

PhraseManager.prototype.getAmountOfPhrasesLoaded = function() {
  return countPhrases();
};


PhraseManager.prototype._register = function(rawPhrases) {
  var that = this;

  rawPhrases.forEach(function(phrase) {
    that._registerPhrase(phrase);
  });
};

PhraseManager.prototype.get = function(domain, id) {
  if (!id) {
    return _.cloneDeep(this.list[domain]);
  } else {
    var phrase = _.filter(this.list[domain], function(phrase) {
      if (id === phrase.id) {
        return phrase;
      }
    });

    phrase = phrase.length > 0 ? phrase[0] : null;

    return _.cloneDeep(phrase);
  }
};


module.exports = new PhraseManager();