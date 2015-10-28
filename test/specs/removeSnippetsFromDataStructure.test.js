var composr = require('../../src/composr-core'),
chai = require('chai'),
chaiAsPromised = require('chai-as-promised'),
sinon = require('sinon'),
expect = chai.expect,
should = chai.should();

chai.use(chaiAsPromised);

var utilsPromises = require('../utils/promises');

describe('removeSnippetsFromDataStructure method', function() {

  var snippet0 = {id:0};
  var snippet1 = {id:1};
  var snippet2 = {id:2};
  var snippet3 = {id:3};
  beforeEach(function() {
    composr.data.snippets = [snippet0,snippet1,snippet2];
  });

  afterEach(function() {
    composr.data = {};
  });

  it('Resolves removeSnippetsFromDataStructure correctly with an array', function() {
    var newSnippets = [snippet1.id,snippet2.id];
    composr.removeSnippetsFromDataStructure(newSnippets);
    expect(composr.data.snippets[0].id).to.equals(0);
    expect(composr.data.snippets.length).to.equals(1);
  });

  it('Resolves removeSnippetsFromDataStructure correctly with a string', function() {
    var newSnippets = snippet1.id;
    composr.removeSnippetsFromDataStructure(newSnippets);
    expect(composr.data.snippets[0].id).to.equals(0);
    expect(composr.data.snippets[1].id).to.equals(2);
    expect(composr.data.snippets.length).to.equals(2);
  });

  it('Resolves removeSnippetsFromDataStructure correctly with a falsy', function() {
    composr.removeSnippetsFromDataStructure();
    expect(composr.data.snippets.length).to.equals(3);
  });

  it('Resolves removeSnippetsFromDataStructure correctly with an array with two snippets with same id', function() {
    var newSnippets = [snippet1.id,snippet1.id];
    composr.removeSnippetsFromDataStructure(newSnippets);
    expect(composr.data.snippets[0].id).to.equals(0);
    expect(composr.data.snippets[1].id).to.equals(2);
    expect(composr.data.snippets.length).to.equals(2);
  });

});
