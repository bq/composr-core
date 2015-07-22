var composr = require('../../src/composr-core'),
  chai = require('chai'),
  expect = chai.expect;

describe('CompoSR core API', function(){

  it('expected methods are available', function() {
    expect(composr).to.respondTo('run');
    expect(composr).to.respondTo('getPhraseIndexById');
    expect(composr).to.respondTo('getPhraseByMatchingPath');
    expect(composr).to.respondTo('registerPhrase');
    expect(composr).to.respondTo('unregisterPhrase');
  });

});