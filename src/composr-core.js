'use strict'

var events = require('./lib/events')
var PhraseManager = require('./lib/managers/Phrase')
var SnippetsManager = require('./lib/managers/Snippet')
var VirtualDomainManager = require('./lib/managers/VirtualDomain')
var Requirer = require('./lib/requirer')

function CompoSR () {
  this.reset()
}

CompoSR.prototype.init = require('./lib/init')
CompoSR.prototype.initCorbelDriver = require('./lib/initCorbelDriver')
CompoSR.prototype.clientLogin = require('./lib/clientLogin')
CompoSR.prototype.bindConfiguration = require('./lib/bindConfiguration')

CompoSR.prototype.phraseDao = require('./lib/daos/phraseDao')
CompoSR.prototype.snippetDao = require('./lib/daos/snippetDao')
CompoSR.prototype.virtualDomainDao = require('./lib/daos/virtualDomainDao')

CompoSR.prototype.documentation = require('./lib/doc/documentation')
CompoSR.prototype.reset = require('./lib/reset')

CompoSR.prototype.ComposrError = require('./lib/ComposrError')
CompoSR.prototype.parseToComposrError = require('./lib/parseToComposrError')
CompoSR.prototype.utils = require('./lib/utils')
CompoSR.prototype.events = events

var Snippets = new SnippetsManager({
  events: events
})

var requirer = new Requirer({
  events: events,
  Snippet: Snippets
})

CompoSR.prototype.requirer = requirer

CompoSR.prototype.Snippet = Snippets

var Phrases = new PhraseManager({
  events: events,
  requirer: requirer
})

CompoSR.prototype.Phrase = Phrases

var VirtualDomain = new VirtualDomainManager({
  events: events,
  Phrase: Phrases,
  Snippet: Snippets
})

CompoSR.prototype.VirtualDomain = VirtualDomain

// CompoSR.prototype._logger = require('./lib/logger')
// TODO: load integrations, integrations with load a logger that will suscribe to the debug, warn , error and info events and log them
// All the integrations will be handled by the events module.

module.exports = new CompoSR()
