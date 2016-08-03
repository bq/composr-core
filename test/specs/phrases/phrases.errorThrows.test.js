var PhraseManager = require('../../../src/lib/managers/Phrase'),
  SnippetsManager = require('../../../src/lib/managers/Snippet'),
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

    Phrases.requirer = new Requirer({
      events: {
        emit: sinon.stub()
      },
      Snippets: Snippets
    });


    Phrases.register(domain, phrasesToRegister)
      .should.be.fulfilled.notify(done);
  });


  describe('Error handlers in function mode', function() {

    it('Throwns a custom error', function(done) {
      var result = Phrases.runByPath(domain, 'error/506', 'get', {
        functionMode : true
      });

      expect(result).to.exist;

      result
        .should.be.rejected
        .then(function(response) {
          expect(spyRun.callCount).to.equals(1);
          expect(response).to.be.an('object');
          expect(response).to.include.keys(
            'status',
            'body'
          );
          expect(response.status).to.equals(506);
          expect(typeof response.body).to.equals('object');
          expect(response.body.error).to.equals('error');
          expect(response.body.errorDescription).to.equals('description');
          
        })
        .should.notify(done);
    });

    it('Handles an error sended correctly', function(done) {
      var result = Phrases.runByPath(domain, 'senderror/507', 'get', {
        functionMode : true
      });

      expect(result).to.exist;

      result
        .should.be.rejected
        .then(function(response) {
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
          
        })
        .should.notify(done);
    });

    it('Handles a string error', function(done) {
      var result = Phrases.runByPath(domain, 'texterror', 'get', {
        functionMode : true
      });

      expect(result).to.exist;

      result
        .should.be.rejected
        .then(function(response) {
          expect(spyRun.callCount).to.equals(1);
          expect(response).to.be.an('object');
          expect(response).to.include.keys(
            'status',
            'body'
          );
          expect(response.status).to.equals(500);
          expect(typeof response.body).to.equals('object');
          expect(response.body.error).to.equals('error:phrase:exception:texterror');
          expect(response.body.errorDescription).to.equals('hola');
          
        })
        .should.notify(done);
    });

    it('Returns phrase cant be runned if missing', function(done) {
      //@TODO: See if we want to return that error directly or a wrappedResponse with 404 status
      var result = Phrases.runByPath(domain, 'missingendpoint', 'get', {
        functionMode : true
      });

      expect(result).to.exist;

      result
        .should.be.rejected
        .then(function(response) {
          expect(response).to.equals('phrase:cant:be:runned');
        })
        .should.notify(done);
    });
    
  });


});