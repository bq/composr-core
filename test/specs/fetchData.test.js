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
    stubFetchPhrases = sinon.stub(composr.phraseDao, 'loadAll', utilsPromises.resolvedCurriedPromise(['test']));
    stubFetchSnippets = sinon.stub(composr.snippetDao, 'loadAll', utilsPromises.resolvedCurriedPromise(['test']));
  });

  after(function() {
    stubFetchPhrases.restore();
    stubFetchSnippets.restore();
  });

  it('Resolves correctly', function(done) {
    composr.fetchData()
      .should.be.fulfilled
      .then(function() {
        expect(composr.data.phrases).to.exist;
        expect(composr.data.snippets).to.exist;
        expect(composr.data.phrases[0]).to.equals('test');
        expect(composr.data.snippets[0]).to.equals('test');

      }).should.notify(done);
  });

});

describe('fail fetchData', function() {
  var stubFetchPhrases, stubFetchSnippets;

  it('fails if loadPhrases fails', function(done) {
    stubFetchPhrases = sinon.stub(composr.phraseDao, 'loadAll', utilsPromises.rejectedPromise);
    stubFetchSnippets = sinon.stub(composr.snippetDao, 'loadAll', utilsPromises.resolvedCurriedPromise(['test']));

    composr.fetchData().should.be.rejected.notify(done);
  });

  it('fails if loadSnippets fails', function(done) {
    stubFetchPhrases = sinon.stub(composr.phraseDao, 'loadAll', utilsPromises.resolvedCurriedPromise(['test']));
    stubFetchSnippets = sinon.stub(composr.snippetDao, 'loadAll', utilsPromises.rejectedPromise);

    composr.fetchData().should.be.rejected.notify(done);
  });

  afterEach(function() {
    stubFetchPhrases.restore();
    stubFetchSnippets.restore();
  });
});