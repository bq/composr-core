'use strict'

var q = require('q')
var _ = require('lodash')
var semver = require('semver')
var raml2obj = require('raml2obj')
var ramlCompiler = require('../compilers/raml.compiler')

/**
 * Loads a raml definition from the doc contained into a phrase
 * @param  {String} domain
 * @param  {Object} phrases
 * @return {String}
 */
function documentation (phrases, snippets, domain, version, basePathDoc) {
  if (!phrases) {
    phrases = []
  }

  if (!snippets) {
    snippets = []
  }

  if (!version) {
    var versions = _.uniq(phrases.map(function (phrase) {
      return phrase.getVersion()
    }))
    // Get the max version for the default screen
    version = semver.maxSatisfying(versions, '*')
  }

  var dfd = q.defer()
  var module = this

  var urlBase = this.config.urlBase.replace('{{module}}', 'composr').replace('/v1.0', '')

  var phrasesOfEachVersion = _.groupBy(phrases, function (item) {
    return item.getVersion()
  })

  var versionsData = Object.keys(phrasesOfEachVersion).map(function (version) {
    return {
      name: version,
      phrases: _.filter(phrases, ['json.version', version]),
      snippets: _.filter(snippets, ['json.version', version])
    }
  })

  var phrasesToShow = phrases.filter(function (item) {
    return item.getVersion() === version
  })

  var snippetsToShow = snippets.filter(function (item) {
    return item.getVersion() === version
  })

  phrasesToShow = phrasesToShow.map(function (item) {
    return item.getRawModel()
  })

  snippetsToShow = snippetsToShow.map(function (item) {
    return item.getRawModel()
  })

  var data = ramlCompiler.transform(phrasesToShow, urlBase, domain, version)

  raml2obj.parse(data)
    .then(function (ramlObj) {
      var nunjucks = require('nunjucks')
      var markdown = require('nunjucks-markdown')
      var marked = require('marked')
      var ramljsonexpander = require('raml-jsonschema-expander')
      var renderer = new marked.Renderer()
      renderer.table = function (thead, tbody) {
        // Render Bootstrap style tables
        return '<table class="table"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>'
      }

      // Setup the Nunjucks environment with the markdown parser
      var env = nunjucks.configure(__dirname, { watch: false })
      markdown.register(env, function (md) {
        return marked(md, { renderer: renderer })
      })

      // Add extra function for finding a security scheme by name
      ramlObj.securitySchemeWithName = function (name) {
        for (var index = 0; index < ramlObj.securitySchemes.length; ++index) {
          if (ramlObj.securitySchemes[index][name] !== null) {
            return ramlObj.securitySchemes[index][name]
          }
        }
      }
      // Find and replace the $ref parameters.
      ramlObj = ramljsonexpander.expandJsonSchemas(ramlObj)

      //Add the original phrase reference to each parsed resource.
      ramlObj.resources = ramlObj.resources.map(function(item){
        item.originalPhrase = _.filter(phrasesToShow, function(phrase){
          return ('/' + phrase.url) === item.relativeUri
        })[0]
        return item
      })


      ramlObj.versions = versionsData

      ramlObj.snippets = snippetsToShow.map(function (snippet) {
        snippet.date = Date(snippet._createdAt)
        return snippet
      })

      ramlObj.basePathDoc = basePathDoc || ''

     
      // Render the main template using the raml object and fix the double quotes
      var html = env.render('./template.nunjucks', ramlObj)
      html = html.replace(/&quot;/g, '"')
      module.events.emit('debug', 'generated:documentation')
      dfd.resolve(html)
    })
    .catch(function (err) {
      module.events.emit('error', 'error:generating:documentation', err)
      dfd.reject(err)
    })

  return dfd.promise
}

module.exports = documentation
