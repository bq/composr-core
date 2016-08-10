var PhraseManager = require('../../../src/lib/managers/Phrase'),
  SnippetsManager = require('../../../src/lib/managers/Snippet'),
  ComposrError = require('../../../src/lib/ComposrError'),
  Requirer = require('../../../src/lib/requirer'),
  events = require('../../../src/lib/events'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

describe('Phrases runner', function() {
  var domain = 'bq:domain';
  var spyRun;
  var stubEvents, Phrases;

  var phrasesToRegister = [{
    'url': 'error/:code',
    'version': '1.2.3',
    'get': {
      'code': 'var ComposrError = require("ComposrError"); throw new ComposrError("error", "description", req.params.code);',
      'doc': {

      }
    }
  },
  {
    'url': 'senderror/:code',
    'version': '1.2.3',
    'get': {
      'code': 'var ComposrError = require("ComposrError"); res.status(req.params.code).send(new ComposrError("error", "description", req.params.code));',
      'doc': {

      }
    }
  },
  {
    'url': 'texterror',
    'version': '1.2.3',
    'get': {
      'code': 'throw("hola");',
      'doc': {

      }
    }
  }];

  beforeEach(function(done) {
    stubEvents = sinon.stub();

    Phrases = new PhraseManager({
      events: {
        emit: stubEvents
      },
      config: {
        urlBase: 'demo'
      }
    });

    spyRun = sinon.spy(Phrases, '_run');

    //New snippets instance
    var Snippets = new SnippetsManager({
      events: {
        emit: sinon.stub()
      }
    });

    Phrases.requirer = Requirer(Snippets);


    Phrases.register(domain, phrasesToRegister)
      .should.be.fulfilled.notify(done);
  });


  describe('Error handlers in function mode', function() {

    it('Throwns a custom error', function() {
      var fn = function(){
        Phrases.runByPath(domain, 'error/506', 'get', {
          functionMode : true
        }, null, function(){})
      };

      expect(fn).to.throw(Error)
      expect(fn).to.throw(ComposrError)
    });

    it('Handles an error sended correctly', function(done) {
      Phrases.runByPath(domain, 'senderror/507', 'get', {
        functionMode : true
      }, null, function(err, response){
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(507);
        expect(typeof response.body).to.equals('object');
        expect(response.body.error).to.equals('error');
        expect(response.body.errorDescription).to.equals('description');
        done(err);
      });
    });

    it('Crashes on unhandled error', function() {
      var fn = function(){
        Phrases.runByPath(domain, 'texterror', 'get', {
          functionMode : true
        }, null, function(){})
      };

      expect(fn).to.throw('hola')
    });

    it('Returns phrase cant be runned if missing', function(done) {
      //@TODO: See if we want to return that error directly or a wrappedResponse with 404 status
      Phrases.runByPath(domain, 'missingendpoint', 'get', {
        functionMode : true
      }, null, function(err, response){
        expect(err).to.equals('phrase:cant:be:runned');
        done();
      });
    });
  });

  describe('Error handlers in VM mode', function() {

    it('Throwns a custom error', function() {
      var fn = function(){
        Phrases.runByPath(domain, 'error/506', 'get', {
          functionMode : false
        }, null, function(){})
      };

      expect(fn).to.throw(Error)
      expect(fn).to.throw(ComposrError)
    });

    it('Handles an error sended correctly', function(done) {
      Phrases.runByPath(domain, 'senderror/507', 'get', {
        functionMode : false
      }, null, function(err, response){
        expect(spyRun.callCount).to.equals(1);
        expect(response).to.be.an('object');
        expect(response).to.include.keys(
          'status',
          'body'
        );
        expect(response.status).to.equals(507);
        expect(typeof response.body).to.equals('object');
        expect(response.body.error).to.equals('error');
        expect(response.body.errorDescription).to.equals('description');
        done(err);
      });
    });

    it('Crashes on unhandled error', function() {
      var fn = function(){
        Phrases.runByPath(domain, 'texterror', 'get', {
          functionMode : false
        }, null, function(){})
      };

      expect(fn).to.throw('hola')
    });

    it('Returns phrase cant be runned if missing', function(done) {
      //@TODO: See if we want to return that error directly or a wrappedResponse with 404 status
      Phrases.runByPath(domain, 'missingendpoint', 'get', {
        functionMode : false
      }, null, function(err, response){
        expect(err).to.equals('phrase:cant:be:runned');
        done();
      });
    });
  });
});