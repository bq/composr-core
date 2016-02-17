'use strict';

var VirtualDomainDao = function () {
};

VirtualDomainDao.prototype.load = function (id) {
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

VirtualDomainDao.prototype.loadAll = function () {
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

module.exports = VirtualDomainDao;