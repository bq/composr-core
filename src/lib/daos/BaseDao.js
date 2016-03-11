'use strict';
var driverStore = require('../stores/corbelDriver.store');
var utils = require('../utils');

var BaseDao = function(options) {
  this.COLLECTION = options.collection;
};

BaseDao.prototype.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id');
  }

  if (driverStore.getDriver()) {
    return driverStore.getDriver()
      .resources
      .resource(this.COLLECTION, id)
      .get()
      .then(function (response) {
        return response.data;
      });
  } else {
    return Promise.reject('missing:driver');
  }
};

BaseDao.prototype.loadSome = function(ids){
  var that = this;

  if (!ids || !Array.isArray(ids)) {
    return Promise.reject('missing:ids');
  }

  if (driverStore.getDriver()) {

    var caller = function (pageNumber, pageSize) {
      return driverStore.getDriver()
      .resources
      .collection(that.COLLECTION)
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

BaseDao.prototype.loadAll = function () {
  var that = this;
  var caller = function (pageNumber, pageSize) {
    return driverStore.getDriver()
      .resources
      .collection(that.COLLECTION)
      .get({
        pagination: {
          page: pageNumber,
          pageSize: pageSize
        }
      });
  };

  return utils.getAllRecursively(caller);
};

BaseDao.prototype.save = function(item){
  if(!driverStore.getDriver()){
    return Promise.reject('missing:driver');
  }

  return driverStore.getDriver()
    .resources
    .resource(this.COLLECTION, item.id)
    .update(item);
};

module.exports = BaseDao;