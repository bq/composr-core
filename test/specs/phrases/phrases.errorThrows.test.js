var PhraseManager = require('../../../src/lib/Phrases'),
  SnippetsManager = require('../../../src/lib/Snippets'),
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
    'get': {
      'code': 'var ComposrError = require("ComposrError"); throw new ComposrError("error", "description", req.params.code);',
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


  describe('Error handlers in browser mode', function() {

    it('Throwns a custom error', function(done) {
      var result = Phrases.runByPath(domain, 'error/506', 'get', {
        browser : true
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
          expect(response.body).to.be.an('object');
          expect(response.body.error).to.equals('error');
          expect(response.body.errorDescription).to.equals('description');
          
        })
        .should.notify(done);
    });

    
  });


});