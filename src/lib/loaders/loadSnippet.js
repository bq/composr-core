'use strict';

var loadSnippet = function loadSnippet(id) {
  if(!id){
    return Promise.reject('missing:id');
  }

  if (this.corbelDriver) {
    return this.corbelDriver.resources
      .resource(this.resources.snippetsCollection, id)
      .get()
      .then(function(response){
        return response.data;
      });
  } else {
    return Promise.reject('missing:driver');
  }
};


module.exports = loadSnippet;