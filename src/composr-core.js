'use strict';

var events = require('./lib/events');
var PhraseManager = require('./lib/Phrases');
var SnippetsManager = require('./lib/Snippets');
var VirtualDomainManager = require('./lib/VirtualDomain');
var Requirer = require('./lib/requirer');

function CompoSR() {
  this.reset();

  //Loaded resources
  this.data = {
    phrases: [],
    snippets: [],
    virtualDomains: []
  };
}

CompoSR.prototype.init = require('./lib/init');
CompoSR.prototype.initCorbelDriver = require('./lib/initCorbelDriver');
CompoSR.prototype.clientLogin = require('./lib/clientLogin');
CompoSR.prototype.bindConfiguration = require('./lib/bindConfiguration');
CompoSR.prototype.phraseDao = require('./lib/loaders/phraseDao');
CompoSR.prototype.snippetDao = require('./lib/loaders/snippetDao');
CompoSR.prototype.virtualDomainDao = require('./lib/loaders/virtualDomainDao');
CompoSR.prototype.addPhrasesToDataStructure = require('./lib/addPhrasesToDataStructure');
CompoSR.prototype.addSnippetsToDataStructure = require('./lib/addSnippetsToDataStructure');
CompoSR.prototype.removePhrasesFromDataStructure = require('./lib/removePhrasesFromDataStructure');
CompoSR.prototype.removeSnippetsFromDataStructure = require('./lib/removeSnippetsFromDataStructure');
CompoSR.prototype.fetchData = require('./lib/fetchData');
CompoSR.prototype.registerData = require('./lib/registerData');
CompoSR.prototype.documentation = require('./lib/doc/documentation');
CompoSR.prototype.reset = require('./lib/reset');
CompoSR.prototype.status = require('./lib/status');
CompoSR.prototype.ComposrError = require('./lib/ComposrError');
CompoSR.prototype.parseToComposrError = require('./lib/parseToComposrError');
CompoSR.prototype.utils = require('./lib/utils');
CompoSR.prototype.events = events;

var VirtualDomain = new VirtualDomainManager({
  events: events
});
CompoSR.prototype.VirtualDomain = VirtualDomain;

var Snippets = new SnippetsManager({
  events: events
});

var requirer = new Requirer({
  events: events,
  Snippets: Snippets
});

CompoSR.prototype.requirer = requirer;

CompoSR.prototype.Snippets = Snippets;

CompoSR.prototype.Phrases = new PhraseManager({
  events: events,
  requirer : requirer
});

CompoSR.prototype.Publisher = require('./lib/Publisher');
//CompoSR.prototype._logger = require('./lib/logger');
//TODO: load integrations, integrations with load a logger that will suscribe to the debug, warn , error and info events and log them
//All the integrations will be handled by the events module.


module.exports = new CompoSR();
