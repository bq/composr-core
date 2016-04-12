'use strict'

var BaseStore = require('./BaseStore')

var PhraseStore = function () {}

PhraseStore.prototype = new BaseStore()

var singletonPhraseStore = new PhraseStore()

module.exports = singletonPhraseStore
