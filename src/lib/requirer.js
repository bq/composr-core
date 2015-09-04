'use strict';
var _ = require('lodash');
var SNIPPETS_PREFIX = 'snippet-';

var ALLOWED_LIBRARIES = {
  'q': require('q'),
  'http': require('http'),
  'request': require('request'),
  'async': require('async'),
  'corbel-js': require('corbel-js'),
  'lodash': require('lodash')
};

var driverObtainFunction = function(defaults) {
  return function(options) {
    var generatedOptions = _.defaults(_.cloneDeep(options), defaults);
    return ALLOWED_LIBRARIES['corbel-js'].getDriver(generatedOptions);
  };
};

function Requirer(options) {
  this.Snippets = options.Snippets;
  this.events = options.events;
}

Requirer.prototype.configure = function(config){
  ALLOWED_LIBRARIES['corbel-js'].generateDriver = driverObtainFunction({
    urlBase: config.urlBase
  });
};

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

module.exports = Requirer;