'use strict'

var core = require('../src/composr-core');
var phrasesFixtures = require('../test/fixtures/phrases');
var express = require('express');
var app = express();

var domain = 'demo:domain';


app.get('/', function (req, res) {
  core.init({ urlBase : 'http://localhost:3000'}, false)
    .then(registerPhrases)
    .then(function(){
      return serveDocumentation(req, res);
    })
    .catch(function(err){
      console.log(err);
      res.status(500).send('Error', err);
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function registerPhrases(){
  return core.Phrase.register(domain, phrasesFixtures.correct);
}

function serveDocumentation (req, res, next) {

  var phrases = core.Phrase.getPhrases(domain)

  return core.documentation(phrases, null, domain, '')
    .then(function (result) {
      res.send(result)
    });
}