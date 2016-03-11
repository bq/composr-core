var composr = require('../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');

describe('CompoSR core API', function() {

  it('expected methods are available', function() {
    expect(composr).to.respondTo('init');
    expect(composr).to.respondTo('initCorbelDriver');
    expect(composr).to.respondTo('clientLogin');
    expect(composr).to.respondTo('documentation');
    expect(composr).to.respondTo('reset');
    expect(composr).to.respondTo('bindConfiguration');
    expect(composr).to.have.property('phraseDao');
    expect(composr).to.have.property('snippetDao');
    expect(composr).to.have.property('Phrase');
    expect(composr).to.have.property('Snippet');
    expect(composr).to.have.property('VirtualDomain');
    expect(composr).to.have.property('events');
    expect(composr).to.have.property('utils');
    expect(composr).to.have.property('requirer');
  });

});