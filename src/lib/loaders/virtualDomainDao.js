'use strict';

var VirtualDomainDao = {};

VirtualDomainDao.load = function (id) {
  if (!id) {
    return Promise.reject('missing:id');
  }

  if (this.corbelDriver) {
    return this.corbelDriver.resources.resource(this.resources.virtualDomainCollection, id)
      .get()
      .then(function (response) {
        return response.data;
      });
  } else {
    return Promise.reject('missing:driver');
  }
};

VirtualDomainDao.loadAll = function () {
  var module = this;
  var caller = function (pageNumber, pageSize) {
    return module.corbelDriver.resources.collection(module.resources.virtualDomainCollection).get({
      pagination: {
        page: pageNumber,
        pageSize: pageSize
      }
    });
  };

  return this.utils.getAllRecursively(caller);
};

module.exports = {
  load: VirtualDomainDao.load,
  loadAll: VirtualDomainDao.loadAll
};