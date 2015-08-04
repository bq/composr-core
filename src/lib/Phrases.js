'use strict';
var phraseValidator = require('./validators/phrase.validator.js');
var regexpGenerator = require('./regexpGenerator');
var q = require('q');

var Phrases = {
  prototype: {
    //Stores the phrases in memory on a list by domain
    _register: function() {

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
      var module = this;

      var compiled = {};

      compiled.url = phrase.url;

      //The regexp reference dictaminates the routing mechanisms
      compiled.regexpReference = regexpGenerator.regexpReference(phrase.url);

      var methods = ['get', 'put', 'post', 'delete'];

      compiled.codes = {};

      //Create in memory functions with the evaluation of the codes
      methods.forEach(function(method) {
        if (phrase[method] && (phrase[method].code || phrase[method].codehash)) {
          module.events.emit('debug', 'phrase_manager:evaluatecode:', method, phrase.id);

          var code = phrase[method].code ? phrase[method].code : new Buffer(phrase[method].codehash, 'base64').toString('utf8');
          compiled.codes[method] = module._evaluateCode(code);
        }
      });

      module.events.emit('Phrases:compiled', compiled);

      return compiled;

    },

    //Creates a function based on a function body and some params.
    _evaluateCode: function(functionBody, params) {
      var phraseParams = params ? params : ['req', 'res', 'next', 'corbelDriver', 'corbel', 'ComposrError', 'domain', '_', 'q', 'request', 'compoSR'];
      var result = {
        fn: null,
        error: false
      };

      try {
        /* jshint evil:true */
        result.fn = Function.apply(null, phraseParams.concat(functionBody));
      } catch (e) {
        this.events.emit('warn', 'phrase_manager:evaluatecode:wrong_code', e);
        result.error = true;
      }

      return result;
    },

    //Verifies that a JSON for a phrase is well formed
    validate: function(model) {
      var dfd = q.defer();
      phraseValidator(model)
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

    //Executes a phrase
    run: function() {

    },

    //Returns one or all the phrases
    get: function() {

    }
  },
  create: function(options) {
    // do stuff with options
    return Object.create(Phrases.prototype, options);
  }
};

module.exports = Phrases.create();