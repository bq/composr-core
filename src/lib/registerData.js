'use strict';

var q = require('q');

var registerData = function registerData() {

  return q.all(this.Phrases.registerWithoutDomain(this.data.phrases),
    this.Snippets.registerWithoutDomain(this.data.snippets),
    this.VirtualDomain.registerWithoutDomain(this.data.virtualDomains));
};

module.exports = registerData;