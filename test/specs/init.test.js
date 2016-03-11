var composr = require('../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');

describe('Config initialization', function() {

  var stubLogClient, stubRegisterDomains, stubInitCorbelDriver, 
    stubLoadVirtualDomains, spyRequirerConfigure, spyPhrasesConfigure;

  var sandbox = sinon.sandbox.create();

  describe('Correct initialization', function() {
    beforeEach(function() {
      stubInitCorbelDriver = sandbox.stub(composr, 'initCorbelDriver', utilsPromises.resolvedPromise);
      stubLogClient = sandbox.stub(composr, 'clientLogin', utilsPromises.resolvedPromise);
      spyRequirerConfigure = sandbox.spy(composr.requirer, 'configure');
      spyPhrasesConfigure = sandbox.spy(composr.Phrase, 'configure');
      sandbox.stub(composr.virtualDomainDao, 'loadAll', utilsPromises.resolvedCurriedPromise([]));
      sandbox.stub(composr.phraseDao, 'loadAll', utilsPromises.resolvedCurriedPromise([]));
      sandbox.stub(composr.snippetDao, 'loadAll', utilsPromises.resolvedCurriedPromise([]));
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('Creates the config object', function(done) {
      var options = {};

      composr.init(options)
        .then(function() {
          expect(composr).to.have.property('config');
          expect(composr.config).to.have.property('credentials');
          expect(composr.config).to.have.property('timeout');
          expect(composr.config).to.have.property('urlBase');
          expect(spyRequirerConfigure.callCount).to.equals(1);
          expect(spyPhrasesConfigure.callCount).to.equals(1);
          expect(stubInitCorbelDriver.callCount).to.equals(0);
          done();
        })
        .catch(function(err) {
          console.log(err);
          done(err);
        });
    });

    it('Config is correctly initialized', function(done) {
      var options = {
        credentials: {
          clientId: 'demo',
          clientSecret: 'demo',
          scopes: 'demo'
        },
        urlBase: 'demo',
        timeout: 3000
      };

      composr.init(options, true)
        .then(function() {
          expect(composr).to.have.property('config');
          expect(composr.config).to.have.property('credentials');
          expect(composr.config).to.have.property('timeout');
          expect(composr.config).to.have.property('urlBase');

          expect(composr.config.credentials).to.have.property('clientId');
          expect(composr.config.credentials).to.have.property('clientSecret');
          expect(composr.config.credentials).to.have.property('scopes');

          expect(composr.config.credentials.clientId).to.equals('demo');
          expect(composr.config.credentials.clientSecret).to.equals('demo');
          expect(composr.config.credentials.scopes).to.equals('demo');
          expect(composr.config.urlBase).to.equals('demo');
          expect(composr.config.timeout).to.equals(3000);
          
          expect(spyPhrasesConfigure.callCount).to.equals(1);
          expect(composr.Phrase.config.urlBase).to.equals('demo');
          done();
        })
        .catch(function(err) {
          console.log(err);
          done(err);
        })
    });
  });

  describe('Invalid initialization', function() {
    var spyEvents;

    before(function() {
      stubInitCorbelDriver = sandbox.stub(composr, 'initCorbelDriver', utilsPromises.rejectedPromise);
      stubLogClient = sandbox.stub(composr, 'clientLogin', utilsPromises.resolvedPromise);
      stubLoadVirtualDomains = sandbox.stub(composr.VirtualDomain.dao, 'loadAll', utilsPromises.resolvedPromise);
      stubRegisterDomains = sandbox.stub(composr.VirtualDomain, 'registerWithoutDomain', utilsPromises.resolvedPromise);
      spyEvents = sandbox.spy(composr.events, 'emit');
    });

    after(function() {
      sandbox.restore();
    });

    it('should emit an error event', function(done) {
      var options = {
        credentials: {
          clientId: 'demo',
          clientSecret: 'demo',
          scopes: 'demo'
        },
        urlBase: 'demo',
        timeout: 3000
      };

      composr.init(options, true)
        .catch(function() {
          expect(spyEvents.callCount).to.be.above(0);
          //TODO: Find the bug with the "error" word on the catch.
          expect(spyEvents.calledWith('errore', 'error:initializing')).to.equals(true);
        })
        .should.notify(done);
    });
  });

});