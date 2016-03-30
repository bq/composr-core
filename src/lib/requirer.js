'use strict';

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

function Requirer(options) {
  this.Snippet = options.Snippet;
  this.events = options.events;
}

Requirer.prototype.configure = function(config) {
  this.urlBase = config.urlBase;
};

Requirer.prototype.forDomain = function(domain, version, functionMode) {
  var module = this;

  return function(libName) {
    if (!libName || typeof(libName) !== 'string') {
      libName = '';
    }

    if (libName.indexOf(SNIPPETS_PREFIX) !== -1) {

      libName = libName.replace(SNIPPETS_PREFIX, '');
      var snippet = module.Snippet.getSnippet(domain, libName, version);

      var returnedResult = null;
      //Execute the exports function
      if (snippet) {
        module.events.emit('debug', 'executing:' + libName + ':functionmode:' + functionMode);
        snippet.execute(functionMode, function(res){
          //TODO: What that bug!!
          returnedResult = res;
        });
      }
      else {
        module.events.emit('warn','The snippet with domain (' + domain + ') and name (' + libName + ') is not found');
      }

      return returnedResult;

    } else if (libName && Object.keys(ALLOWED_LIBRARIES).indexOf(libName) !== -1) {
      var lib = require(libName);

      return lib;
    } else if (libName && Object.keys(LOCAL_LIBRARIES).indexOf(libName) !== -1) {
      var locallib = require(LOCAL_LIBRARIES[libName]);
      return locallib;
    }
    return null;
  };
};

module.exports = Requirer;
