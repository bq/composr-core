'use strict';

var SnippetDao = {};

SnippetDao.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id');
  }

  if (this.corbelDriver) {
    return this.corbelDriver.resources
      .resource(this.resources.snippetsCollection, id)
      .get()
      .then(function (response) {
        return response.data;
      });
  } else {
    return Promise.reject('missing:driver');
  }
};

SnippetDao.loadSome = function(ids){
  if (!id || !Array.isArray(ids)) {
    return Promise.reject('missing:ids');
  }

  if (this.corbelDriver) {

    var module = this;
    var caller = function (pageNumber, pageSize) {
      return module.corbelDriver.resources.collection(module.resources.snippetsCollection)
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

SnippetDao.loadAll = function () {
  var module = this;
  var caller = function (pageNumber, pageSize) {
    return module.corbelDriver.resources.collection(module.resources.snippetsCollection).get({
      pagination: {
        page: pageNumber,
        pageSize: pageSize
      }
    });
  };

  return this.utils.getAllRecursively(caller);
};

module.exports = {
  load: SnippetDao.load,
  loadAll: SnippetDao.loadAll
};