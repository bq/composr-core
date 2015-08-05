'use strict';

var q = require('q');

var registerData = function registerData(){

  this.Phrases.register(this.data.phrases);
  this.Snippets.register(this.data.snippets);  

  return q.resolve();
};

module.exports = registerData;