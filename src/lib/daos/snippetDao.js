'use strict'

var COLLECTION = 'composr:Snippet'
var BaseDao = require('./BaseDao')

var SnippetDao = function () {}

SnippetDao.prototype = new BaseDao({
  collection: COLLECTION
})

module.exports = new SnippetDao()
