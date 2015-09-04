var composr = require('../../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../../utils/promises');
var phrasesFixtures = require('../../fixtures/phrases');


describe.only('Config initialization', function() {

  var stubLogClient, stubRegisterData, stubInitCorbelDriver, stubFetchData;

  before(function() {
    stubInitCorbelDriver = sinon.stub(composr, 'initCorbelDriver', utilsPromises.resolvedPromise);
    stubLogClient = sinon.stub(composr.loginManager, 'clientLogin', utilsPromises.resolvedPromise);
    stubFetchData = sinon.stub(composr, 'fetchData', utilsPromises.resolvedPromise);
    stubRegisterData = sinon.stub(composr, 'registerData', utilsPromises.resolvedPromise);
  });

  after(function() {
    stubInitCorbelDriver.restore();
    stubLogClient.restore();
    stubFetchData.restore();
    stubRegisterData.restore();
    spyRequirerConfigure.restore();
  });

  it('Can register phrases', function(done) {
    var options = {};

    composr.init(options)
      .then(function() {
        return composr.Phrases.register('myDomain', phrasesFixtures.correct);
      })
      .should.be.fulfilled
      .then(function(results){
        console.log(results);
        results.forEach(function(result){
          expect(result.registered).to.equals(true);
        });
        var candidates = composr.Phrases.getPhrases('myDomain');
        console.log(candidates);
        console.log(composr.Phrases.__phrases);
        expect(candidates.length).to.be.above(0);
        done();
      })
      .catch(function(err) {
        console.log(err);
      })

  });

});