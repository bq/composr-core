'use strict';
var driverStore = require('../stores/corbelDriver.store');
var utils = require('../utils');
var COLLECTION = 'composr:VirtualDomain';

var VirtualDomainDao = {};

VirtualDomainDao.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id');
  }

  if (driverStore.getDriver()) {
    return driverStore.getDriver().resources.resource(COLLECTION, id)
      .get()
      .then(function (response) {
        return response.data;
      });
  } else {
    return Promise.reject('missing:driver');
  }
};

VirtualDomainDao.loadAll = function () {
  var caller = function (pageNumber, pageSize) {
    return driverStore.getDriver().resources.collection(COLLECTION).get({
      pagination: {
        page: pageNumber,
        pageSize: pageSize
      }
    });
  };

  return utils.getAllRecursively(caller);
};

VirtualDomainDao.save = function(item){
  if(!driverStore.getDriver()){
    return Promise.reject('missing:driver');
  }

  return driverStore.getDriver().resources.resource(COLLECTION, item.id)
    .update(item);
};

module.exports = VirtualDomainDao;