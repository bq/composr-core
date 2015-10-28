var composr = require('../../src/composr-core'),
chai = require('chai'),
chaiAsPromised = require('chai-as-promised'),
sinon = require('sinon'),
expect = chai.expect,
should = chai.should();

chai.use(chaiAsPromised);

var utilsPromises = require('../utils/promises');

describe('removePhrasesFromDataStructure method', function() {

  var phrase0 = {id:0};
  var phrase1 = {id:1};
  var phrase2 = {id:2};
  var phrase3 = {id:3};
  beforeEach(function() {
    composr.data.phrases = [phrase0,phrase1,phrase2];
  });

  afterEach(function() {
    composr.data = {};
  });

  it('Resolves removePhrasesFromDataStructure correctly with an array', function() {
    var newPhrases = [phrase1.id,phrase2.id];
    composr.removePhrasesFromDataStructure(newPhrases);
    expect(composr.data.phrases[0].id).to.equals(0);
    expect(composr.data.phrases.length).to.equals(1);
  });

  it('Resolves removePhrasesFromDataStructure correctly with a string', function() {
    var newPhrases = phrase1.id;
    composr.removePhrasesFromDataStructure(newPhrases);
    expect(composr.data.phrases[0].id).to.equals(0);
    expect(composr.data.phrases[1].id).to.equals(2);
    expect(composr.data.phrases.length).to.equals(2);
  });

  it('Resolves removePhrasesFromDataStructure correctly with a falsy', function() {
    composr.removePhrasesFromDataStructure();
    expect(composr.data.phrases.length).to.equals(3);
  });

  it('Resolves removePhrasesFromDataStructure correctly with an array with two phrases with same id', function() {
    var newPhrases = [phrase1.id,phrase1.id];
    composr.removePhrasesFromDataStructure(newPhrases);
    expect(composr.data.phrases[0].id).to.equals(0);
    expect(composr.data.phrases[1].id).to.equals(2);
    expect(composr.data.phrases.length).to.equals(2);
  });

});
