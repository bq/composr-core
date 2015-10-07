'use strict';

var loadPhrase = function loadPhrase(id) {
  if(!id){
    return Promise.reject('missing:id');
  }
  
  if (this.corbelDriver) {
    return this.corbelDriver.resources
      .resource(this.resources.phrasesCollection, id)
      .get();
  } else {
    return Promise.reject('missing:driver');
  }
};


module.exports = loadPhrase;