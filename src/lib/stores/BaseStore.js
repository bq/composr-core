'use strict'

var _ = require('lodash')

var BaseStore = function () {
  this.reset()
}

BaseStore.prototype.getAsList = function (domain) {
  var list = []
  var store = this

  if (!domain) {
    list = _.flatten(Object.keys(store.item).map(function (key) {
      return store.item[key]
    }))
  } else if (store.item[domain]) {
    list = store.item[domain]
  }

  return list
}

BaseStore.prototype.getItemIndexById = function (domain, id) {
  var candidates = this.getAsList(domain)
  var index = -1

  for (var i = 0; i < candidates.length; i++) {
    if (candidates[i].getId() === id) {
      index = i
      break
    }
  }
  return index
}

BaseStore.prototype.add = function (domain, model) {
  if (!this.item[domain]) {
    this.item[domain] = []
  }

  var index = this.getItemIndexById(domain, model.getId())

  if (index === -1) {
    this.item[domain].push(model)
  } else {
    this.item[domain][index] = model
  }
}

BaseStore.prototype.remove = function (domain, id) {
  var index = this.getItemIndexById(domain, id)
  if (index !== -1) {
    this.item[domain].splice(index, 1)
  }
}

BaseStore.prototype.exists = function (domain, id) {
  return this.getItemIndexById(domain, id) !== -1
}

BaseStore.prototype.get = function (domain, id) {
  var candidates = this.getAsList(domain)
  var index = this.getItemIndexById(domain, id)

  return index !== -1 ? candidates[index] : null
}

BaseStore.prototype.set = function (items) {
  this.item = items
}

BaseStore.prototype.reset = function () {
  this.item = {}
}

module.exports = BaseStore
