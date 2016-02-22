'use strict';

var PhraseDao = function() {};

PhraseDao.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id');
  }

  if (this.corbelDriver) {
    return this.corbelDriver.resources
      .resource(this.resources.phrasesCollection, id).get()
      .then(function (response) {
        return response.data;
      });
  } else {
    return Promise.reject('missing:driver');
  }
};

PhraseDao.loadSome = function(ids){
  if (!ids || !Array.isArray(ids)) {
    return Promise.reject('missing:ids');
  }

  if (this.corbelDriver) {

    var module = this;
    var caller = function (pageNumber, pageSize) {
      return module.corbelDriver.resources.collection(module.resources.phrasesCollection)
      .get({
        pagination: {
          page: pageNumber,
          pageSize: pageSize
        },
        query: [{
          '$in': {
            'id': ids
          }
        }]
      });
    };
    
    return this.utils.getAllRecursively(caller);
  } else {
    return Promise.reject('missing:driver');
  }
};

PhraseDao.loadAll = function () {
  var module = this;
  var caller = function (pageNumber, pageSize) {
    return module.corbelDriver.resources.collection(module.resources.phrasesCollection).get({
      pagination: {
        page: pageNumber,
        pageSize: pageSize
      }
    });
  };

  return this.utils.getAllRecursively(caller);
};

module.exports = {
  load: PhraseDao.load,
  loadAll: PhraseDao.loadAll
};