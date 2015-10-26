var composr = require('../../src/composr-core'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var utilsPromises = require('../utils/promises');

describe('addPhrasesToDataStructure method', function() {

  var stubFetchPhrases, stubFetchSnippets;
  var phrase0 = {id:0};
  var phrase1 = {id:1};
  var phrase2 = {id:2};
  beforeEach(function() {

    stubFetchPhrases = sinon.stub(composr, 'loadPhrases', utilsPromises.resolvedCurriedPromise([phrase0]));
    stubFetchSnippets = sinon.stub(composr, 'loadSnippets', utilsPromises.resolvedCurriedPromise(['test']));
    composr.fetchData()
      .should.be.fulfilled
      .then(function() {
        expect(composr.data.phrases).to.exist;
        expect(composr.data.snippets).to.exist;
        expect(composr.data.phrases[0]).to.equals(phrase0);
        expect(composr.data.snippets[0]).to.equals('test');

      });
  });

  afterEach(function() {
    stubFetchPhrases.restore();
    stubFetchSnippets.restore();
  });

  it('Resolves addPhrasesToDataStructure correctly with an array', function() {
      var newPhrases = [phrase1,phrase2];
      composr.addPhrasesToDataStructure(newPhrases);
      expect(composr.data.phrases[1].id).to.equals(1);
      expect(composr.data.phrases[2].id).to.equals(2);
      expect(composr.data.phrases.length).to.equals(3);
  });

  it('Resolves addPhrasesToDataStructure correctly with a string', function() {
      var newPhrases = phrase1;
      composr.addPhrasesToDataStructure(newPhrases);
      expect(composr.data.phrases[1].id).to.equals(1);
      expect(composr.data.phrases.length).to.equals(2);
  });

  it('Resolves addPhrasesToDataStructure correctly with a falsy', function() {
      composr.addPhrasesToDataStructure();
      expect(composr.data.phrases.length).to.equals(1);
  });

  it('Resolves addPhrasesToDataStructure correctly with an array with two phrases with same id', function() {
      var newPhrases = [phrase1,phrase1];
      composr.addPhrasesToDataStructure(newPhrases);
      expect(composr.data.phrases.length).to.equals(1);
  });

});
