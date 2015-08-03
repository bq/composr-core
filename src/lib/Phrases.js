'use strict';
var phraseValidator = require('./validators/phrase.validator.js');

var Phrases = {
  prototype: {
    _register: function(){

    },

    _unregister: function(){

    },
    _compile : function(){

    },
    validate : function(model){
      
      var errors = phraseValidator(model);
      if(errors.length > 0){
        return {
          valid : false,
          errors : errors
        };
      }else{
        return {
          valid : true
        };
      }
    },
    run : function(){

    },
    get: function(){

    }
  },
  create: function(options){
    // do stuff with options
    return Object.create(Phrases.prototype, options);
  }
};

module.exports = Phrases.create();