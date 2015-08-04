'use strict';
var phraseValidator = require('./validators/phrase.validator.js');
var q = require('q');

var Phrases = {
  prototype: {
    _register: function() {

    },

    _unregister: function() {

    },
    _compile: function() {

    },
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
    run: function() {

    },
    get: function() {

    }
  },
  create: function(options) {
    // do stuff with options
    return Object.create(Phrases.prototype, options);
  }
};

module.exports = Phrases.create();