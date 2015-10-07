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
    expect(composr).to.respondTo('registerData');
    expect(composr).to.respondTo('loadPhrases');
    expect(composr).to.respondTo('loadPhrase');
    expect(composr).to.respondTo('loadSnippets');
    expect(composr).to.respondTo('loadSnippet');
    expect(composr).to.respondTo('documentation');
    expect(composr).to.respondTo('reset');
    expect(composr).to.respondTo('status');
    expect(composr).to.respondTo('bindConfiguration');
    expect(composr).to.have.property('Phrases');
    expect(composr).to.have.property('Snippets');
    expect(composr).to.have.property('Publisher');
    expect(composr).to.have.property('events');
    expect(composr).to.have.property('utils');
    expect(composr).to.have.property('requirer');
    //expect(composr).to.have.property('_logger');
  });

});