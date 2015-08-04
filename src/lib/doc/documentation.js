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
function documentation(phrases, domain){
  /*jshint validthis:true */
  var dfd = q.defer();

  var urlBase = this.config.urlBase.replace('{{module}}', 'composr').replace('/v1.0', '');
  
  ramlCompiler.compile(phrases, urlBase, domain)
    .then(function(data){
      var config = raml2html.getDefaultConfig(true);
      raml2html.render(data, config, function(result) {
        dfd.resolve(result);
      }, function(error) {  
        dfd.reject(error);
      });
    })
    .catch(dfd.reject);

  return dfd.promise;
}

module.exports = documentation;