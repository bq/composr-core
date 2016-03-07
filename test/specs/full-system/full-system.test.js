var composr = require('../../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../../utils/promises');
var phrasesFixtures = require('../../fixtures/phrases');
var snippetsFixtures = require('../../fixtures/snippets');
var virtualDomainFixtures = require('../../fixtures/virtualdomains');


describe.only('Full system usage', function() {
  this.timeout(10000);

  var sandbox = sinon.sandbox.create();

  var stubLogClient, stubRegisterData, stubInitCorbelDriver;
  var stubLoadPhrases, stubLoadSnippets, stubLoadVirtualDomains;

  before(function() {
    stubInitCorbelDriver = sandbox.stub(composr, 'initCorbelDriver', utilsPromises.resolvedPromise);
    stubLogClient = sandbox.stub(composr, 'clientLogin', utilsPromises.resolvedPromise);
    //Stub loaders
    stubLoadPhrases = sandbox.stub(composr.Phrase, 'load', utilsPromises.resolvedCurriedPromise([]));
    stubLoadSnippets = sandbox.stub(composr.Snippet, 'load', utilsPromises.resolvedCurriedPromise([]));
    stubLoadVirtualDomains = sandbox.stub(composr.VirtualDomain, 'load', utilsPromises.resolvedCurriedPromise([]));
  });

  after(function() {
    sandbox.restore();
  });

  it('Can register phrases', function(done) {
    var options = {};

    composr.init(options, true)
      .then(function() {
        return composr.Phrase.register('myDomain', phrasesFixtures.correct);
      })
      .then(function(results) {
        results.forEach(function(result) {
          expect(result.registered).to.equals(true);
        });

        var candidates = composr.Phrase.getPhrases('myDomain');

        expect(candidates.length).to.be.above(0);

      }).should.notify(done);

  });

  it('Can Register Snippets', function(done) {

    composr.init({}, true)
      .then(function() {
        return composr.Snippet.register('myDomain', snippetsFixtures.correct);
      })
      .should.be.fulfilled
      .then(function(results) {

        results.forEach(function(result) {
          expect(result.registered).to.equals(true);
        });

        var candidates = composr.Snippet.getSnippets('myDomain');

        expect(candidates).to.be.a('object');

        expect(Object.keys(candidates).length).to.be.above(0);

      }).should.notify(done);
  });

  it('Can register virtualDomains', function(done){
    composr.init({}, true)
      .then(function() {
        return composr.VirtualDomain.register('myDomain', virtualDomainFixtures.correct);
      })
      .then(function(results) {
        results.forEach(function(result) {
          expect(result.registered).to.equals(true);
        });

        var candidates = composr.VirtualDomain.getVirtualDomains('myDomain');

        expect(candidates).to.be.a('array');

        expect(candidates.length).to.be.above(0);
      })
      .should.notify(done);
  });


  it('shares the events object reference', function(done) {
    var stub = sinon.stub();
    var stub2 = sinon.stub();

    composr.events.on('debug', 'myProject', stub);
    composr.Phrase.events.on('debug', 'myProject2', stub2);

    composr.Phrase.register('myDomain', phrasesFixtures.correct)
      .should.be.fulfilled
      .then(function(results) {
        expect(stub.callCount).to.be.above(0);
        expect(stub2.callCount).to.be.above(0);
        expect(stub2.callCount).to.equals(stub.callCount);
      }).should.notify(done);
  });

});