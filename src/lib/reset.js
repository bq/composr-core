'use strict';

function reset() {
  /*jshint validthis:true */
  this.config = null;

  //Corbel collections  
  this.resources = {
    phrasesCollection: 'composr:Phrase',
    snippetsCollection: 'composr:Snippet'
  };

  //Loaded resources
  this.data = {
    phrases: [],
    snippets: []
  };

  this.corbelDriver = null;
}

module.exports = reset;