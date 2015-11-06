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
var LOCAL_LIBRARIES = {
  'ComposrError': './ComposrError',
  'composrUtils': './utils'
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

Requirer.prototype.configure = function(config) {
  this.urlBase = config.urlBase;
};

Requirer.prototype.forDomain = function(domain, functionMode) {
  var module = this;
  this.functionMode = functionMode;

  return function(libName) {
    if (!libName || typeof(libName) !== 'string') {
      libName = '';
    }

    if (libName.indexOf(SNIPPETS_PREFIX) !== -1) {

      libName = libName.replace(SNIPPETS_PREFIX, '');
      var snippet = module.Snippets.getByName(domain, libName);

      var returnedResult = null;
      //Execute the exports function
      if (snippet) {

        if (module.functionMode) {
          module.events.emit('debug', 'executing:' + libName + ':functionmode');
          snippet.code.fn(function(res) {
            returnedResult = res;
          });
        } else {
          module.events.emit('debug', 'executing:' + libName + ':scriptmode');
          snippet.code.script.runInNewContext({
            exports: function(res) {
              returnedResult = res;
            }
          });
        }
      }
      else {
        module.events.emit('warn','The snippet with domain (' + domain + ') and name (' + libName + ') is not found');
      }

      return returnedResult;

    } else if (libName && Object.keys(ALLOWED_LIBRARIES).indexOf(libName) !== -1) {
      var lib = require(libName);
      if (libName === 'corbel-js') {
        lib.generateDriver = driverObtainFunction({
          urlBase: module.urlBase
        });
      }
      return lib;
    } else if (libName && Object.keys(LOCAL_LIBRARIES).indexOf(libName) !== -1) {
      var locallib = require(LOCAL_LIBRARIES[libName]);
      return locallib;

    }
    return null;
  };
};

module.exports = Requirer;
