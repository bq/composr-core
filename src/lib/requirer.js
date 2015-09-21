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

var exportsFunction = function(thing){
  return thing;
};

function Requirer(options) {
  this.Snippets = options.Snippets;
  this.events = options.events;
}

Requirer.prototype.configure = function(config) {
  ALLOWED_LIBRARIES['corbel-js'].generateDriver = driverObtainFunction({
    urlBase: config.urlBase
  });
};

Requirer.prototype.forDomain = function(domain) {
  var module = this;

  return function(libName) {
    if (!libName || typeof(libName) !== 'string') {
      libName = '';
    }

    if (libName.indexOf(SNIPPETS_PREFIX) !== -1) {

      libName = libName.replace(SNIPPETS_PREFIX, '');
      var snippet = module.Snippets.getByName(domain, libName);

      //Execute the exports function
      return snippet ? snippet.code.fn(exportsFunction) : null;

    } else if (libName && Object.keys(ALLOWED_LIBRARIES).indexOf(libName) !== -1) {

      return ALLOWED_LIBRARIES[libName];
    }

    return null;
  };
};

module.exports = Requirer;