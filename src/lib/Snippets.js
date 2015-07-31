'use strict';

var SnippetsManager = {
  prototype: {
    _register: function(){

    }
  },
  create: function(options){
    // do stuff with options
    return Object.create(SnippetsManager.prototype, options);
  }
};

module.exports = SnippetsManager.create();