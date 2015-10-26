'use strict';

var events = require('./lib/events');
var PhraseManager = require('./lib/Phrases');
var SnippetsManager = require('./lib/Snippets');
var Requirer = require('./lib/requirer');

function CompoSR() {
  this.reset();
}

CompoSR.prototype.init = require('./lib/init');
CompoSR.prototype.initCorbelDriver = require('./lib/initCorbelDriver');
CompoSR.prototype.clientLogin = require('./lib/clientLogin');
CompoSR.prototype.bindConfiguration = require('./lib/bindConfiguration');
CompoSR.prototype.loadPhrases = require('./lib/loaders/loadPhrases');
CompoSR.prototype.loadPhrase = require('./lib/loaders/loadPhrase');
CompoSR.prototype.loadSnippets = require('./lib/loaders/loadSnippets');
CompoSR.prototype.loadSnippet = require('./lib/loaders/loadSnippet');
CompoSR.prototype.addPhrasesToDataStructure = require('./lib/addPhrasesToDataStructure');
CompoSR.prototype.addSnippetsToDataStructure = require('./lib/addSnippetsToDataStructure');
CompoSR.prototype.fetchData = require('./lib/fetchData');
CompoSR.prototype.registerData = require('./lib/registerData');
CompoSR.prototype.documentation = require('./lib/doc/documentation');
CompoSR.prototype.reset = require('./lib/reset');
CompoSR.prototype.status = require('./lib/status');
CompoSR.prototype.utils = require('./lib/utils');
CompoSR.prototype.events = events;

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
