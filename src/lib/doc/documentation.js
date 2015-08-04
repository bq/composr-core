'use strict';

var q = require('q');
var ramlCompiler = require('../compilers/raml.compiler');
var raml2html = require('raml2html');

/**
 * Loads a raml definition from the doc contained into a phrase
 * @param  {String} domain
 * @param  {Object} phrases
 * @return {String}
 */
function documentation(phrases, domain) {
  /*jshint validthis:true */
  var dfd = q.defer();

  var urlBase = this.config.urlBase.replace('{{module}}', 'composr').replace('/v1.0', '');

  var data = ramlCompiler.transform(phrases, urlBase, domain);

  var config = raml2html.getDefaultConfig();
  
  raml2html.render(data, config)
  .then(function(result) {
    dfd.resolve(result);
  }, function(error) {
    dfd.reject(error);
  });

  return dfd.promise;
}

module.exports = documentation;