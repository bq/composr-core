'use strict';

var Publisher = {
  prototype: {
    publish: function(){

    },
    fetch: function(){

    },
    remove: function(){

    },
  },
  create: function(options){
    // do stuff with options
    return Object.create(Publisher.prototype, options);
  }
};

module.exports = Publisher.create();