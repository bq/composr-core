'use strict';

var BaseStore = require('./BaseStore');

var SnippetStore = function() {};

SnippetStore.prototype = new BaseStore();

var singletonSnippetStore = new SnippetStore();

module.exports = singletonSnippetStore;