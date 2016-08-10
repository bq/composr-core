'use strict'

var COLLECTION = 'composr:VirtualDomain'
var BaseDao = require('./BaseDao')

var VirtualDomainDao = function VirtualDomainDao () {}

VirtualDomainDao.prototype = new BaseDao({
  collection: COLLECTION
})

module.exports = new VirtualDomainDao()
