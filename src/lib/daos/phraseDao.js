'use strict'

var COLLECTION = 'composr:Phrase'
var BaseDao = require('./BaseDao')

var PhraseDao = function () {}

PhraseDao.prototype = new BaseDao({
  collection: COLLECTION
})

module.exports = new PhraseDao()
