'use strict';

var SNIPPETS_PREFIX = 'snippet-';

var ALLOWED_LIBRARIES = {
  'q': require('q'),
  'http': require('http'),
  'request': require('request'),
  'async': require('async'),
  'corbel': require('corbel-js'),
  'lodash': require('lodash')
};

function Requirer() {

}

Requirer.prototype.forDomain = function(domain) {
  var module = this;

  return function(libName) {
    if (libName.indexOf(SNIPPETS_PREFIX) !== -1) {
      libName = libName.replace(SNIPPETS_PREFIX, '');
      return module.Snippets.getById(domain, libName);
    } else if (Object.keys(ALLOWED_LIBRARIES).indexOf(libName) !== -1) {
      return ALLOWED_LIBRARIES[libName];
    }
    return null;
  };
};

module.exports = new Requirer();