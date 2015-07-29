var composr = require('../../src/composr-core'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  expect = chai.expect, 
  should = chai.should();

  chai.use(chaiAsPromised);

var utilsPromises = require('../utils/promises');

describe('fetchData method', function() {

  var stubFetchPhrases, stubFetchSnippets;

  before(function() {
    stubFetchPhrases = sinon.stub(composr, 'loadPhrases', utilsPromises.resolvedCurriedPromise(['test']));
    stubFetchSnippets = sinon.stub(composr, 'loadSnippets', utilsPromises.resolvedCurriedPromise(['test']));
  });

  after(function() {
    stubFetchPhrases.restore();
    stubFetchSnippets.restore();
  });

  it('Resolves correctly', function(done){
    composr.fetchData()
      .then(function(){
        expect(composr.data.phrases).to.exist;
        expect(composr.data.snippets).to.exist;
        expect(composr.data.phrases[0]).to.equals('test');
        expect(composr.data.snippets[0]).to.equals('test');

      }).should.be.fulfilled.notify(done);
  });

});
