var composr = require('../../src/composr-core'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var utilsPromises = require('../utils/promises');

describe('CompoSR core API', function() {

  it('expected methods are available', function() {
    expect(composr).to.respondTo('init');
    expect(composr).to.respondTo('initCorbelDriver');
    expect(composr).to.respondTo('logClient');
    expect(composr).to.respondTo('registerData');
    expect(composr).to.respondTo('init');
    expect(composr).to.have.property('Phrases');
    expect(composr).to.have.property('Snippets');
    //expect(composr.Phrases).to.respondTo('validate');
    //expect(composr.Phrases).to.respondTo('compile');
    //expect(composr.Phrases).to.respondTo('run');
    //expect(composr.Phrases).to.respondTo('get');
    //expect(composr.Phrases).to.respondTo('publish');
    //expect(composr.Phrases).to.respondTo('remove');
    //expect(composr.Phrases).to.respondTo('register');
    //expect(composr.Phrases).to.respondTo('unregister');
  });

});