'use strict';
var driverStore = require('../stores/corbelDriver.store');
var utils = require('../utils');
var parseToComposrError = require('../parseToComposrError');

var BaseDao = function(options) {
  this.COLLECTION = options.collection;
};

BaseDao.prototype.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id');
  }

  var that = this;

  if (driverStore.getDriver()) {
    return driverStore.getDriver()
      .resources
      .resource(this.COLLECTION, id)
      .get()
      .then(function (response) {
        return response.data;
      })
      .catch(function(response){
        var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' load', response.status);
        throw error;
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
    
    return utils.getAllRecursively(caller)
      .catch(function(response){
        var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' load', response.status);
        throw error;
      });
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

  return utils.getAllRecursively(caller)
    .catch(function(response){
      var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' load', response.status);
      throw error;
    });
};

BaseDao.prototype.save = function(item, driver){
  if(!driverStore.getDriver() && !driver){
    return Promise.reject('missing:driver');
  }

  var that = this;

  var theDriver = driver ? driver : driverStore.getDriver();

  return theDriver
    .resources
    .resource(this.COLLECTION, item.id)
    .update(item)
    .catch(function(response){
      var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' save', response.status);
      throw error;
    });
};


BaseDao.prototype.delete = function(id, driver){
  if(!driverStore.getDriver() && !driver){
    return Promise.reject('missing:driver');
  }

  if(!id){
    return Promise.reject(parseToComposrError({}, 'Invalid ' + this.COLLECTION + ' delete', 401));
  }

  var that = this;

  var theDriver = driver ? driver : driverStore.getDriver();

  return theDriver
    .resources
    .resource(this.COLLECTION, id)
    .delete()
    .catch(function(response){
      var error = parseToComposrError(response.data, 'Invalid ' + that.COLLECTION + ' delete', response.status);
      throw error;
    });
};

module.exports = BaseDao;