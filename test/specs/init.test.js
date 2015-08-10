var composr = require('../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');


describe('Config initialization', function() {

  var stubLogClient, stubRegisterData, stubInitCorbelDriver, stubFetchData;

  before(function() {
    stubInitCorbelDriver = sinon.stub(composr, 'initCorbelDriver', utilsPromises.resolvedPromise);
    stubLogClient = sinon.stub(composr.loginManager, 'logClient', utilsPromises.resolvedPromise);
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
        expect(composr.config.timeout).to.equals(3000);
        done();
      })
      .catch(function(err) {
        console.log(err);
      })
  });
});