'use strict';
var phraseValidator = require('./validators/phrase.validator.js');
var regexpGenerator = require('./regexpGenerator');
var mockedExpress = require('./mock');
var utils = require('./utils');

var q = require('q');
var _ = require('lodash');
var XRegExp = require('xregexp').XRegExp;

var DEFAULT_PHRASE_PARAMETERS = ['req', 'res', 'next', 'corbelDriver', 'domain', 'require'];

var Phrases = {
  prototype: {
    __phrases: {},

    resetPhrases: function() {
      this.__phrases = {};
    },

    //Register accepts either a single object or an array
    register: function(phraseOrPhrases, phrasesDomain) {
      var dfd = q.defer();

      var module = this;

      var isArray = Array.isArray(phraseOrPhrases);

      if (isArray === false) {
        phraseOrPhrases = [phraseOrPhrases];
      }

      phraseOrPhrases = _.cloneDeep(phraseOrPhrases);

      var promises = phraseOrPhrases.map(function(phrase) {
        return module._register(phrase, phrasesDomain);
      });

      //TODO: think if reject the promise or not. 
      //For a bunch of phrases it's better to not fail and register the ones that are OK, but for one phrase maybe it has sense to fail
      //but 2 different behaviours aren't good. 
      // - Maybe allways resolve the registration and include in the resolution how many have been registered?
      // - Or not register anyone if some one fails? Thats a bit dangerous though
      q.allSettled(promises)
        .then(function(results) {

          //result has => value === resolved/ state === 'fulfilled' / reason === error
          results = results.map(function(result, index) {
            var returnedInfo = {
              registered: result.state === 'fulfilled',
              id: phraseOrPhrases[index].id,
              compiled: result.state === 'fulfilled' ? result.value : null,
              error: result.reason ? result.reason : null
            };

            return returnedInfo;
          });

          if (isArray) {
            dfd.resolve(results);
          } else {
            dfd.resolve(results[0]);
          }
        });

      return dfd.promise;
    },

    //Stores the phrases in memory on a list by domain
    _register: function(phrase, phrasesDomain) {
      var dfd = q.defer();

      var module = this;

      this.validate(phrase)
        .then(function() {
          var phraseDomain = phrasesDomain ? phrasesDomain : module._extractPhraseDomain(phrase);

          var phraseId = module._generateId(phrase.url, phraseDomain);
          if (!phrase.id) {
            phrase.id = phraseId;
          }

          var compiled = module.compile(phrase);

          var phrasesWithTheSamePath = module._filterByRegexp(phrasesDomain, compiled.regexpReference.regexp);

          if (phrasesWithTheSamePath.length > 0) {
            module.events.emit('warn', 'phrase:path:duplicated', phrase.url);
          }

          if (compiled) {
            var added = module._addToList(phraseDomain, compiled);
            module.events.emit('debug', 'phrase:registered', added, phrase.id);
            dfd.resolve(compiled);
          } else {
            module.events.emit('warn', 'phrase:not:registered', phrase.id);
            dfd.reject();
          }

        })
        .catch(function(err) {
          module.events.emit('warn', 'phrase:not:registered', 'phrase:not:valid', phrase.id, err);
          dfd.reject(err);
        });

      return dfd.promise;
    },

    //Modifies the internal __phrases list
    _addToList: function(phraseDomain, phraseCompiled) {
      if (!phraseDomain || !phraseCompiled) {
        return false;
      }

      if (typeof(phraseCompiled) !== 'object' || phraseCompiled.hasOwnProperty('id') === false || !phraseCompiled.id) {
        return false;
      }

      if (!this.__phrases[phraseDomain]) {
        this.__phrases[phraseDomain] = [];
      }

      var index = this._getPhraseIndexById(phraseDomain, phraseCompiled.id);

      if (index === -1) {
        this.__phrases[phraseDomain].push(phraseCompiled);
      } else {
        this.__phrases[phraseDomain][index] = phraseCompiled;
      }

      return true;
    },

    //Removes phrases from memory
    _unregister: function() {

    },

    //Generates the regular expressions for the phrases endpoints
    compile: function(phraseOrPhrases) {

      var module = this;

      var isArray = Array.isArray(phraseOrPhrases);

      if (isArray === false) {
        phraseOrPhrases = [phraseOrPhrases];
      }

      var compiledResults = phraseOrPhrases.map(function(phrase) {
        return module._compile(phrase);
      });

      return isArray ? compiledResults : compiledResults[0];

    },

    _compile: function(phrase) {
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

            var code = phrase[method].code ? phrase[method].code : new Buffer(phrase[method].codehash, 'base64').toString('utf8');
            compiled.codes[method] = module._evaluateCode(code);
          }
        });

        module.events.emit('Phrases:compiled', compiled);

        return compiled;

      } catch (e) {
        //Somehow it has tried to compile an invalid phrase. Notify it and return false.
        //Catching errors and returning false here is important for not having an unstable phrases stack.
        this.events.emit('error', 'phrase:not:usable', phrase.url, e);
        return false;
      }

    },

    //Creates a function based on a function body and some params.
    _evaluateCode: function(functionBody, params) {
      var phraseParams = params ? params : DEFAULT_PHRASE_PARAMETERS;
      var result = {
        fn: null,
        error: false
      };

      try {
        /* jshint evil:true */
        result.fn = Function.apply(null, phraseParams.concat(functionBody));
      } catch (e) {
        this.events.emit('warn', 'phrase:evaluatecode:wrong_code', e);
        result.error = true;
      }

      return result;
    },

    //Verifies that a JSON for a phrase is well formed
    validate: function(phrase) {
      var dfd = q.defer();
      phraseValidator(phrase)
        .then(function() {
          dfd.resolve({
            valid: true
          });
        })
        .catch(function(errors) {
          dfd.reject({
            valid: false,
            errors: errors
          });
        });
      return dfd.promise;
    },

    //Executes a phrase by id
    runById: function(domain, id, verb, params) {
      if(utils.values.isNully(verb)){
        verb = 'get';
      }

      var phrase = this.getById(domain, id);

      if(phrase && phrase.codes[verb] && phrase.codes[verb].error === false){
        this.events.emit('debug', 'running:phrase:byId:' + domain + ':' + id + ':' + verb);
        return this._run(phrase.codes[verb].fn, params, domain);
      }else{
        return q.reject();
      }

    },

    //Executes a phrase matching a path
    runByPath: function(domain, path, verb, params) {
      if(utils.values.isNully(verb)){
        verb = 'get';
      }

      var phrase = this.getByMatchingPath(domain, path, verb);

      if(phrase && phrase.codes[verb].error === false){
        this.events.emit('debug', 'running:phrase:byPath:' + domain + ':' + path + ':' + verb);
        return this._run(phrase.codes[verb].fn, params, domain);
      }else{
        return q.reject();
      }

    },

    //Executes a phrase
    _run : function(phraseCode, params, domain){

      if(!params){
        params = {
          req : mockedExpress.req(),
          res : mockedExpress.res(),
          next : mockedExpress.next
        };
      }
      var newCorbelDriverInstance = 'TODO';
      
      params.corbelDriver = newCorbelDriverInstance;
      params.domain = domain;
      params.require = this.requirer(domain);

      return phraseCode.apply(null, _.values(params));
    },

    //Returns a list of elements matching the same regexp
    _filterByRegexp: function(domain, regexp) {
      var candidates = this._getPhrasesAsList(domain);

      return _.filter(candidates, function(candidate) {
        return candidate.regexpReference.regexp === regexp;
      });
    },

    //Flattens all the phrases in a single list array 
    _getPhrasesAsList: function(domain) {
      var list = [];
      var module = this;

      if (utils.values.isNully(domain)) {
        list = _.flatten(Object.keys(this.__phrases).map(function(key) {
          return module.__phrases[key];
        }));
      } else if (this.__phrases[domain]) {
        list = this.__phrases[domain];
      }

      return list;
    },

    //Returns one phrase matching the id
    getById: function(domain, id) {
      var candidates = this._getPhrasesAsList(domain);
      var index = this._getPhraseIndexById(domain, id);

      return index !== -1 ? candidates[index] : null;
    },

    //Returns the index of a phrase that matches by id
    _getPhraseIndexById: function(domain, id) {
      var candidates = this._getPhrasesAsList(domain);
      var index = -1;

      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].id === id) {
          index = i;
          break;
        }
      }

      return index;
    },

    //Get all the phrases, or all the phrases for one domain
    getPhrases: function(domain) {
      if (!domain) {
        return this._getPhrasesAsList();
      }

      return this.__phrases[domain] ? this.__phrases[domain] : null;
    },

    /** 
      CORE Entry point. One of the purposes of composr-core is to provide a fast and reliable
      getByMatchingPath method.
     **/
    getByMatchingPath: function(domain, path, verb) {
      var candidate = null;

      if (!verb) {
        verb = 'get';
      }

      domain = utils.values.isNully(domain) ? null : domain;

      this.events.emit('debug', 'phrase:getByMatchingPath:' + domain + ':' + path + ':' + verb);

      if (utils.values.isNully(path)) {
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

    },

    //Counts all the loaded phrases
    count: function() {
      return this._getPhrasesAsList().length;
    },

    //Generates a PhraseID from a url an a domain
    _generateId: function(url, domain) {
      return domain + '!' + url.replace(/\//g, '!');
    },

    //Extracts the domain from a phrase
    _extractPhraseDomain: function(phrase) {
      return phrase.id.split('!')[0];
    }
  },
  create: function(options) {
    // do stuff with options
    return Object.create(Phrases.prototype, options);
  }
};

module.exports = Phrases.create();