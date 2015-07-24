var composr = require('../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');

describe('CompoSR core API', function() {

  it('expected methods are available', function() {
    expect(composr).to.respondTo('init');
    expect(composr).to.respondTo('initCorbelDriver');
    expect(composr).to.respondTo('logClient');
    expect(composr).to.respondTo('registerData');
    expect(composr).to.respondTo('init');
    expect(composr).to.have.property('Phrases');
    expect(composr).to.have.property('Snippets');
    //expect(composr.Phrases).to.respondTo('validate');
    //expect(composr.Phrases).to.respondTo('compile');
    //expect(composr.Phrases).to.respondTo('run');
    //expect(composr.Phrases).to.respondTo('get');
    //expect(composr.Phrases).to.respondTo('publish');
    //expect(composr.Phrases).to.respondTo('remove');
    //expect(composr.Phrases).to.respondTo('register');
    //expect(composr.Phrases).to.respondTo('unregister');
  });

});

describe('Config initialization', function() {

  var stubLogClient, stubRegisterData, stubInitCorbelDriver, stubFetchData;

  before(function() {
    stubInitCorbelDriver = sinon.stub(composr, 'initCorbelDriver', utilsPromises.resolvedPromise);
    stubLogClient = sinon.stub(composr, 'logClient', utilsPromises.resolvedPromise);
    stubFetchData = sinon.stub(composr, 'fetchData', utilsPromises.resolvedPromise);
    stubRegisterData = sinon.stub(composr, 'registerData', utilsPromises.resolvedPromise);
  });

  after(function() {
    stubInitCorbelDriver.restore();
    stubLogClient.restore();
    stubFetchData.restore();
    stubRegisterData.restore();
  });

  it('Creates the config object', function(done) {
    var options = {};

    composr.init(options)
      .then(function() {
        expect(composr).to.have.property('config');
        expect(composr.config).to.have.property('credentials');
        expect(composr.config).to.have.property('timeout');
        expect(composr.config).to.have.property('urlBase');
        done();
      })
      .catch(function(err) {
        console.log(err);
      })
  });

  it('Config is correctly initialized', function(done) {
    var options = {
      credentials : {
        clientId : 'demo',
        clientSecret : 'demo',
        scopes : 'demo'
      },
      urlBase : 'demo',
      timeout: 3000
    };

    composr.init(options)
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
        done();
      })
      .catch(function(err) {
        console.log(err);
      })
  });
});