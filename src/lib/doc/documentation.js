'use strict';

var q = require('q');
var ramlCompiler = require('../compilers/raml.compiler');
var phraseValidator = require('../validators/phrase.validator');
var raml2html = require('raml2html');

/**
 * Loads a raml definition from the doc contained into a phrase
 * @param  {String} domain
 * @param  {Object} phrases
 * @return {String}
 */
function documentation(phrases, domain, version) {
  /*jshint validthis:true */
  if (!phrases) {
    phrases = [];
  }

  var dfd = q.defer();
  var module = this;

  var urlBase = this.config.urlBase.replace('{{module}}', 'composr').replace('/v1.0', '');

  var validationPromises = phrases.map(function(phrase) {
    return phraseValidator(phrase);
  });

  var correctPhrases = [];
  var incorrectPhrases = [];

  q.allSettled(validationPromises)
    .then(function(results) {
      results.forEach(function(result, index) {
        if (result.state === 'fulfilled') {
          correctPhrases.push(result.value);
        } else {
          var phrase = phrases[index];
          module.events.emit('warn', 'generating:documentation:invalid-phrase', 'phrase:id: ' + phrase.id, result.reason);
          incorrectPhrases.push(result.reason);
        }
      });
      var data = ramlCompiler.transform(correctPhrases, urlBase, domain, version);
      var config = raml2html.getDefaultConfig('template.nunjucks', __dirname);
      return raml2html.render(data, config);
    })
    .then(function(result) {
      module.events.emit('debug', 'generated:documentation');
      dfd.resolve(result);
    }, function(error) {
      module.events.emit('warn', 'generating:documentation', error);
      dfd.reject(error);
    })
    .catch(function(err){
      module.events.emit('error', 'error:generating:documentation', err);
      dfd.reject(err);
    });



  return dfd.promise;
}

module.exports = documentation;
