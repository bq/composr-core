var PhraseModel = require('../../../src/lib/models/PhraseModel'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('Phrase Model', function() {
  it('Has all the methods needed', function(){
    expect(PhraseModel.prototype).to.respondTo('_generateId');
    expect(PhraseModel.prototype).to.respondTo('getId');
    expect(PhraseModel.prototype).to.respondTo('getMD5');
    expect(PhraseModel.prototype).to.respondTo('getVirtualDomainId');
    expect(PhraseModel.prototype).to.respondTo('getUrl');
    expect(PhraseModel.prototype).to.respondTo('getRegexp');
    expect(PhraseModel.prototype).to.respondTo('getRegexpReference');
    expect(PhraseModel.prototype).to.respondTo('getRawModel');
    expect(PhraseModel.prototype).to.respondTo('canRun');
    expect(PhraseModel.prototype).to.respondTo('matchesPath');
    expect(PhraseModel.prototype).to.respondTo('extractParamsFromPath');
    expect(PhraseModel.prototype).to.respondTo('compile');
    expect(PhraseModel.prototype).to.respondTo('__executeScriptMode');
    expect(PhraseModel.prototype).to.respondTo('__executeFunctionMode');
  });
  //TODO: test all the methods
});