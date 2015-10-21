var composr = require('../../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../../utils/promises');
var phrasesFixtures = require('../../fixtures/phrases');
var snippetsFixtures = require('../../fixtures/snippets');


describe('Full system usage', function() {

  var stubLogClient, stubRegisterData, stubInitCorbelDriver, stubFetchData;

  before(function() {
    stubInitCorbelDriver = sinon.stub(composr, 'initCorbelDriver', utilsPromises.resolvedPromise);
    stubLogClient = sinon.stub(composr, 'clientLogin', utilsPromises.resolvedPromise);
    stubFetchData = sinon.stub(composr, 'fetchData', utilsPromises.resolvedPromise);
    stubRegisterData = sinon.stub(composr, 'registerData', utilsPromises.resolvedPromise);
  });

  after(function() {
    stubInitCorbelDriver.restore();
    stubLogClient.restore();
    stubFetchData.restore();
    stubRegisterData.restore();
  });

  it('Can register phrases', function(done) {
    var options = {};

    composr.init(options, true)
      .then(function() {
        return composr.Phrases.register('myDomain', phrasesFixtures.correct);
      })
      .should.be.fulfilled
      .then(function(results) {

        results.forEach(function(result) {
          expect(result.registered).to.equals(true);
        });

        var candidates = composr.Phrases.getPhrases('myDomain');

        expect(candidates.length).to.be.above(0);

      }).should.notify(done);

  });

  it('Can Register Snippets', function(done) {

    composr.init({}, true)
      .then(function() {
        return composr.Snippets.register('myDomain', snippetsFixtures.correct);
      })
      .should.be.fulfilled
      .then(function(results) {

        results.forEach(function(result) {
          expect(result.registered).to.equals(true);
        });

        var candidates = composr.Snippets.getSnippets('myDomain');

        expect(candidates).to.be.a('object');

        expect(Object.keys(candidates).length).to.be.above(0);

      }).should.notify(done);
  });


  it('shares the events object reference', function(done) {
    var stub = sinon.stub();
    var stub2 = sinon.stub();

    composr.events.on('debug', 'myProject', stub);
    composr.Phrases.events.on('debug', 'myProject2', stub2);

    composr.Phrases.register('myDomain', phrasesFixtures.correct)
      .should.be.fulfilled
      .then(function(results) {
        expect(stub.callCount).to.be.above(0);
        expect(stub2.callCount).to.be.above(0);
        expect(stub2.callCount).to.equals(stub.callCount);
      }).should.notify(done);
  });

});