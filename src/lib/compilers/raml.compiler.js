'use strict';

var raml = require('raml-parser'),
  YAML = require('yamljs'),
  q = require('q'),
  _ = require('lodash');

var buildPhraseDefinition = function(phrase) {
  var doc = {};

  // convert express URL `path/:param1/:param2` to
  // RAML URL`path/{param1}/{param2}`
  var url = phrase.url ? phrase.url.split('/') : [];
  url = url.map(function(item) {
    if (item[0] === ':') {
      item = item.replace(':', '{').replace('?', '');
      item += '}';
    }
    return item;
  }).join('/');

  url = '/' + url;
  doc[url] = {};

  ['get', 'post', 'put', 'delete', 'options'].forEach(function(method) {
    if (phrase[method]) {
      doc[url][method] = phrase[method].doc;

      // oauth_2_0 has specific type for common header documentation
      if (phrase[method].doc && phrase[method].doc.securedBy && phrase[method].doc.securedBy.indexOf('oauth_2_0') !== -1) {
        doc[url].type = 'secured';
      }
    }
  });

  return doc;
};

function transform(phrases, urlBase, domain) {
  var doc = {};

  phrases.forEach(function(phrase) {
    _.extend(doc, buildPhraseDefinition(phrase));
  });

  var definition = [
    '#%RAML 0.8',
    '---',
    'title: ' + domain,
    'baseUri: ' + urlBase + domain,
    'securitySchemes:',
    '    - oauth_2_0:',
    '        description: Corbel supports OAuth 2.0 for authenticating all API requests.',
    '        type: OAuth 2.0',
    '        describedBy:',
    '            headers:',
    '                Authorization:',
    '                    description: Used to send a valid OAuth 2 access token.',
    '                    type: string',
    '            responses:',
    '                401:',
    '                    description: Bad or expired token. To fix, you should re-authenticate the user.',
    '        settings:',
    '            authorizationUri: https://oauth.corbel.io/v1.0/oauth/authorize',
    '            accessTokenUri: https://iam.corbel.io/v1.0/oauth/token',
    '            authorizationGrants: [ code, token ]',
    // workaround to show authorization headers in html doc
    'resourceTypes:',
    '    - secured:',
    '        get?: &common',
    '            headers:',
    '                Authorization:',
    '                    description: Token to access secured resources',
    '                    type: string',
    '                    required: true',
    '        post?: *common',
    '        patch?: *common',
    '        put?: *common',
    '        delete?: *common',
    YAML.stringify(doc, 4)
  ].join('\n');

  return definition;
}

/**
 * Builds a raml definition from the doc contained into a phrase
 * @param  {String} domain
 * @param  {Object} phrase
 * @return {String}
 */
var compile = function(phrases, urlBase, domain) {
  var dfd = q.defer();

  urlBase = urlBase || 'http://test.com';
  domain = domain || 'test-domain';

  var definition = transform(phrases, urlBase, domain);

  //Use the raml.load to parse the formed raml
  raml.load(definition)
    .then(dfd.resolve, dfd.reject);

  return dfd.promise;
};

module.exports.transform = transform;
module.exports.compile = compile;