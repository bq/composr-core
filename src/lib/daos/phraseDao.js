'use strict';
var driverStore = require('../stores/corbelDriver.store');
var COLLECTION = 'composr:Phrase';
var utils = require('../utils');
var PhraseDao = function() {};

PhraseDao.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id');
  }

  if (driverStore.getDriver()) {
    return driverStore.getDriver()
      .resources
      .resource(this.resources.phrasesCollection, id)
      .get()
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

  if (driverStore.getDriver()) {

    var caller = function (pageNumber, pageSize) {
      return driverStore.getDriver()
      .resources
      .collection(COLLECTION)
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
    
    return utils.getAllRecursively(caller);
  } else {
    return Promise.reject('missing:driver');
  }
};

PhraseDao.loadAll = function () {
  var caller = function (pageNumber, pageSize) {
    return driverStore.getDriver()
      .resources
      .collection(COLLECTION)
      .get({
        pagination: {
          page: pageNumber,
          pageSize: pageSize
        }
      });
  };

  return utils.getAllRecursively(caller);
};

PhraseDao.save = function(item){
  if(!driverStore.getDriver()){
    return Promise.reject('missing:driver');
  }

  return driverStore.getDriver()
    .resources
    .resource(COLLECTION, item.id)
    .update(item);
};

module.exports = PhraseDao;