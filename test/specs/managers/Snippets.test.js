var SnippetManager = require('../../../src/lib/managers/Snippet'),
  SnippetModel = require('../../../src/lib/models/SnippetModel'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  q = require('q'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var snippetsFixtures = require('../../fixtures/snippets');
var utilsPromises = require('../../utils/promises');

describe('== Snippets ==', function() {
  var stubEvents, Phrases;

  beforeEach(function() {
    stubEvents = sinon.stub();

    Snippets = new SnippetManager({
      events: {
        emit: stubEvents
      }
    });
  });

  describe('Snippets API', function() {
    it('exposes the expected methods', function() {
      expect(Snippets).to.have.property('dao');
      expect(Snippets).to.have.property('store');
      expect(Snippets).to.have.property('validator');
      expect(Snippets).to.have.property('model');
      expect(Snippets).to.respondTo('resetItems');
      expect(Snippets).to.respondTo('validate');
      expect(Snippets).to.respondTo('getSnippets');
      expect(Snippets).to.respondTo('getSnippet');
      expect(Snippets).to.respondTo('compile');
      expect(Snippets).to.respondTo('_compile');
      expect(Snippets).to.respondTo('register');
      expect(Snippets).to.respondTo('_register');
      expect(Snippets).to.respondTo('unregister');
      expect(Snippets).to.respondTo('_unregister');
    });
  });

 
  describe('Snippets validation', function() {

    it('Validates a good snippet', function(done) {
      var goodSnippetModel = snippetsFixtures.correct[0];

      Snippets.validate(goodSnippetModel)
        .should.be.fulfilled
        .then(function(result) {
          expect(result).to.be.an('object');
          expect(result.valid).to.equals(true);
        })
        .should.notify(done);
    });

    it('Denies all the invalid models', function(done) {
      var promises = snippetsFixtures.malformed.map(function(snippet) {
        return Snippets.validate(snippet);
      });

      q.allSettled(promises)
        .then(function(results) {
          var allRejected = results.reduce(function(prev, next) {
            return prev && next.state === 'rejected';
          }, true);

          expect(allRejected).to.equals(true);
        })
        .should.notify(done);
    });

  });

  describe('Compile snippets', function() {
    var stubEvents;

    beforeEach(function() {
      stubEvents = sinon.stub();

      Snippets.events = {
        emit: stubEvents
      };

    });

    it('should compile a well formed snippet', function() {

      var result = Snippets.compile('domain', {
        name : 'UserModel',
        version : '2.3.3',
        codehash: ''
      });

      expect(result).to.be.instanceof(SnippetModel);
      expect(result).to.include.keys(
        'id',
        'compiled',
        'json'
      );

      expect(result.getName()).to.be.a('string');
      expect(result.getName()).to.equals('UserModel');
      expect(result.getId()).to.equals('domain!UserModel-2.3.3');
      expect(result.compiled.code).to.be.a('object');
      expect(result.compiled.code.fn).to.be.a('function');
    });

    it('should emit an event with information about the compilation', function() {
      var snippet = snippetsFixtures.correct[0];
      var result = Snippets.compile('domain', snippet);

      //one from the evaluate code and one from the compilation
      expect(stubEvents.callCount).to.be.equals(2);
      expect(stubEvents.calledWith('debug', 'snippet:compiled')).to.equals(true);
    });

    it('should allow passing a single snippet', function() {
      var compiled = Snippets.compile('domain', snippetsFixtures.correct[0]);
      expect(Array.isArray(compiled)).to.equals(false);
    });

    it('should allow passing multiple Snippets', function() {
      var compiledSnippets = Snippets.compile('domain', snippetsFixtures.correct);
      expect(Array.isArray(compiledSnippets)).to.equals(true);
    });

  });

  describe('Get Snippets', function() {
    beforeEach(function(done) {
      Snippets.register('testdomain', [{
          name: 'mySnippet1',
          version : '1.1.1',
          codehash: new Buffer('exports(1);').toString('base64')
        },
        {
          name: 'mySnippet1',
          version : '1.1.2',
          codehash: new Buffer('exports(1);').toString('base64')
        },
        {
          name: 'mySnippet2',
          version : '1.1.1',
          codehash: new Buffer('exports(1);').toString('base64')
        },
        {
          name: 'mySnippet3',
          version : '1.1.1',
          codehash: new Buffer('exports(1);').toString('base64')
        }])
      .should.be.fulfilled.notify(done);
    });

    afterEach(function() {
      Snippets.resetItems();
    });

    it('does not returns all the Snippets for all the domains if no domain is provided', function() {
      var candidates = Snippets.getSnippets();
      expect(candidates).to.equals(null);
    });

    it('returns all the Snippets for a single domain', function() {
      var candidates = Snippets.getSnippets('testdomain');
      expect(candidates.length).to.equals(4);
    });

    it('returns a single snippet with correct version', function(){
      var theSnippet = Snippets.getSnippet('testdomain', 'mySnippet1', '1.1.1');
      expect(theSnippet).to.be.a.instanceof(SnippetModel);
      expect(theSnippet.getVersion()).to.equals('1.1.1');
      expect(theSnippet.getName()).to.equals('mySnippet1');
    });

    it('returns a single phrase with correct version', function(){
      var theSnippet = Snippets.getSnippet('testdomain', 'mySnippet1', '1.1.2');
      expect(theSnippet).to.be.a.instanceof(SnippetModel);
      expect(theSnippet.getVersion()).to.equals('1.1.2');
      expect(theSnippet.getName()).to.equals('mySnippet1');
    });

  });

  describe('Snippets unregistration', function() {
    beforeEach(function(done) {
      var snippetsToRegister = [{
        name: 'snippetOne',
        version : '1.0.0',
        codehash: new Buffer('exports("thing");').toString('base64')
      }, {
        name: 'snippetTwo',
        version : '1.0.0',
        codehash: new Buffer('exports("otherthing");').toString('base64')
      }];

      Snippets.register('domainTest', snippetsToRegister)
        .should.be.fulfilled
        .then(function() {
          var isRegisteredOne = Snippets.getSnippet('domainTest', 'snippetOne', '1.0.0');
          var isRegisteredTwo = Snippets.getSnippet('domainTest', 'snippetTwo', '1.0.0');

          expect(isRegisteredOne).to.be.an('object');
          expect(isRegisteredTwo).to.be.an('object');
        })
        .should.notify(done);
    });

    it('should not retrieve a snippet after unregistering it', function() {
      var hasBeenUnregistered = Snippets.unregister('domainTest', 'domainTest!snippetOne-1.0.0');

      var isRegisteredOne = Snippets.getSnippet('domainTest', 'snippetOne', '1.0.0');
      expect(isRegisteredOne).to.be.a('null');
      expect(hasBeenUnregistered).to.equals(true);
    });

  });

  xdescribe('Snippets execution', function() {

  });

});