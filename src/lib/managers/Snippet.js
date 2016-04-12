'use strict'
var BaseManager = require('./base.manager.js')
var SnippetModel = require('../models/SnippetModel.js')
var snippetsStore = require('../stores/snippets.store')
var snippetDao = require('../daos/snippetDao')

var snippetValidator = require('../validators/snippet.validator.js')

var SnippetsManager = function (options) {
  this.events = options.events
}

SnippetsManager.prototype = new BaseManager({
  itemName: 'snippet',
  store: snippetsStore,
  model: SnippetModel,
  dao: snippetDao,
  validator: snippetValidator
})

// Compilation
SnippetsManager.prototype._compile = function (domain, snippet) {
  try {
    var SnippetModel = this.model
    var snippetInstance = new SnippetModel(snippet, domain)

    snippetInstance.compile(this.events)

    this.events.emit('debug', 'snippet:compiled', snippetInstance.getId(), snippetInstance.getName())

    return snippetInstance
  } catch (e) {
    // Somehow it has tried to compile an invalid snippet. Notify it and return false.
    // Catching errors and returning false here is important for not having an unstable snippets stack.
    this.events.emit('error', 'snippet:not:usable', snippet.id, e)
    return false
  }
}

// Get all the snippets for a single domain
SnippetsManager.prototype.getSnippets = function (domain) {
  if (!domain) {
    return null
  }

  return this.store.getAsList(domain)
}

// Get a single snippet
SnippetsManager.prototype.getSnippet = function (domain, name, version) {
  var snippet = this.store.get(domain, domain + '!' + name + '-' + version)

  if (snippet) {
    return snippet
  } else {
    return null
  }
}

// TODO: Remove for using the MD5 check defined in BaseManager
SnippetsManager.prototype.__shouldSave = function () {
  return true
}

module.exports = SnippetsManager
