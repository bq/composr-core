'use strict';

function CompoSR() {
  this.reset();
}

CompoSR.prototype.init = require('./lib/init');
CompoSR.prototype.initCorbelDriver = require('./lib/initCorbelDriver');
CompoSR.prototype.loginManager = require('./lib/loginManager');
CompoSR.prototype.bindConfiguration = require('./lib/bindConfiguration');
CompoSR.prototype.loadPhrases = require('./lib/loadPhrases');
CompoSR.prototype.loadSnippets = require('./lib/loadSnippets');
CompoSR.prototype.fetchData = require('./lib/fetchData');
CompoSR.prototype.registerData = require('./lib/registerData');
CompoSR.prototype.documentation = require('./lib/doc/documentation');
CompoSR.prototype.reset = require('./lib/reset');
CompoSR.prototype.status = require('./lib/status');
CompoSR.prototype.events = require('./lib/events');
CompoSR.prototype.utils = require('./lib/utils');
CompoSR.prototype.Phrases = require('./lib/Phrases');
CompoSR.prototype.Snippets = require('./lib/Snippets');
CompoSR.prototype.Publisher = require('./lib/Publisher');
//CompoSR.prototype._logger = require('./lib/logger');
//TODO: load integrations, integrations with load a logger that will suscribe to the debug, warn , error and info events and log them
//All the integrations will be handled by the events module.

module.exports = new CompoSR();