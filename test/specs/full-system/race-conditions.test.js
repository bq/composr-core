var composr = require('../../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;
  var q = require('q');

var _ = require('lodash');

function suscribeLogs() {
  composr.events.on('debug', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });

  composr.events.on('error', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });

  composr.events.on('warn', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });

  composr.events.on('info', 'CorbelComposr', function() {
    console.log.apply(console.log, arguments);
  });
}

describe.only('Race conditions', function(){
  this.timeout(30000)

  var domain = 'raceconditions';

  var snippetsToRegister = [{
    name: 'parseError',
    version : '5.5.5',
    codehash: new Buffer('var inside = 1; function parseError(err, res){ inside++; var error = { status: err.status || 500, description: inside}; res.send(error.status, error); } exports(parseError);').toString('base64')
  }];

  var phrasesToRegister = [{
    'url': 'race/:name',
    'version' : '5.5.5',
    'get': {
      'code': 'var parseError = require("snippet-parseError"); if(!req.get("Authorization")){ parseError({ status: 401}, res)} else{ res.send(200, req.params.name); }',
      'doc': {

      }
    }
  }, {
    'url': 'race2',
    'version' : '5.5.5',
    'post': {
      'code': 'var parseError = require("snippet-parseError"); if(!req.get("Authorization")){ parseError({ status: 401}, res)} else{ res.send(200, req.body); }',
      'doc': {

      }
    }
  }, {
    'url': 'status/:status',
    'version' : '5.5.5',
    'get': {
      'code': 'var parseError = require("snippet-parseError"); setTimeout(function(){ console.log(req.params); parseError({status: parseInt(req.params.status, 10)}, res) }, 100);',
      'doc': {

      }
    }
  }];

  before(function(done){
    suscribeLogs();
    composr.init({}, false)
      .then(function() {
        return composr.Phrase.register(domain, phrasesToRegister);
      })
      .then(function(){
        return composr.Snippet.register(domain, snippetsToRegister);
      })
      .should.notify(done);
  })

  it('Executes simultaneously the same phrase with different parameters and returns the correct response each time', function(done){

    var candidates = [{
      path: 'race/pepe',
      auth: '',
      expected: {
        status: 401
      }
    },{
      path: 'race2',
      auth: '',
      verb: 'post',
      expected: {
        status: 401
      }
    },{
      path: 'race/sara',
      auth: 'asd',
      expected: {
        status: 200,
        body: 'sara'
      }
    },{
      path: 'race/rere',
      auth: 'asd',
      expected: {
        status: 200,
        body: 'rere'
      }
    },{
      path: 'race2',
      auth: 'asd',
      verb: 'post',
      body: 'randomizer',
      expected: {
        status: 200,
        body: 'randomizer'
      }
    },{
      path: 'status/301',
      auth: 'asd',
      expected: {
        status: 301
      }
    },{
      path: 'status/307',
      auth: 'asd',
      expected: {
        status: 307
      }
    }]

    var promises = [];

    function createRequest(theItem){
      return new Promise(function(resolve, reject){
        var options = {
          headers: {
            'Authorization': theItem.auth
          },
          corbelDriver : {},
          body: theItem.body
        };

        var verb = theItem.verb || 'get'
        var path = theItem.path

        composr.Phrase.runByPath(domain, theItem.path, verb, options, '5.5.5', function(err, response){
          console.log(theItem.path, response.body)
          var validBody = typeof theItem.expected.body !== 'undefined' ?  response.body === theItem.expected.body : true
          if (response.status === theItem.expected.status && validBody){
            resolve()
          }else{
            reject(theItem)
          }
        });
      });
    }

    for( var i = 0; i < 10000; i++){
      var randomPick = _.sample(candidates);
        var promise = createRequest(randomPick);
      promises.push(promise)
    }

    Promise.all(promises)
      .then(function(){
        console.log('ENDED');
        done()
      })
      .catch(function(err){
        console.log(err);
        done(err);
      });
    
  })
})
