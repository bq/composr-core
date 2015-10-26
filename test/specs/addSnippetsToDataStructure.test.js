var composr = require('../../src/composr-core'),
chai = require('chai'),
chaiAsPromised = require('chai-as-promised'),
sinon = require('sinon'),
expect = chai.expect,
should = chai.should();

chai.use(chaiAsPromised);

var utilsPromises = require('../utils/promises');

describe('addSnippetsToDataStructure method', function() {

  var snippet0 = {id:0};
  var snippet1 = {id:1};
  var snippet2 = {id:2};
  beforeEach(function() {
    composr.data.snippets = [snippet0];
  });

  afterEach(function() {
    composr.data = {};
  });

  it('Resolves addSnippetsToDataStructure correctly with an array', function() {
    var newSnippets = [snippet1,snippet2];
    composr.addSnippetsToDataStructure(newSnippets);
    expect(composr.data.snippets[1].id).to.equals(1);
    expect(composr.data.snippets[2].id).to.equals(2);
    expect(composr.data.snippets.length).to.equals(3);
  });

  it('Resolves addSnippetsToDataStructure correctly with a string', function() {
    var newSnippets = snippet1;
    composr.addSnippetsToDataStructure(newSnippets);
    expect(composr.data.snippets[1].id).to.equals(1);
    expect(composr.data.snippets.length).to.equals(2);
  });

  it('Resolves addSnippetsToDataStructure correctly with a falsy', function() {
    composr.addSnippetsToDataStructure();
    expect(composr.data.snippets.length).to.equals(1);
  });

  it('Resolves addSnippetsToDataStructure correctly with an array with two snippets with same id', function() {
    var newSnippets = [snippet1,snippet1];
    composr.addSnippetsToDataStructure(newSnippets);
    expect(composr.data.snippets.length).to.equals(1);
  });

});
