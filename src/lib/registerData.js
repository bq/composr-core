'use strict';

var q = require('q');

var registerData = function registerData(){
  
  this.Phrases._register(this.data.phrases);
  this.Snippets._register(this.data.snippets);  

  return q.resolve();
};

module.exports = registerData;