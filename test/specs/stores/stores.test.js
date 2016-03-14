var phraseStore = require('../../../src/lib/stores/phrases.store'),
  snippetStore = require('../../../src/lib/stores/snippets.store'),
  virtualDomainStore = require('../../../src/lib/stores/virtualDomain.store'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;


describe('Phrase Store', function() {
  it('Exposes the needed API', function(){
    expect(phraseStore).to.respondTo('add');
    expect(phraseStore).to.respondTo('get');
    expect(phraseStore).to.respondTo('set');
    expect(phraseStore).to.respondTo('getAsList');
    expect(phraseStore).to.respondTo('remove');
    expect(phraseStore).to.respondTo('reset');
    expect(phraseStore).to.respondTo('exists');
    expect(phraseStore).to.respondTo('getItemIndexById');
  });
});

describe('Snippet Store', function() {
  it('Exposes the needed API', function(){
    expect(snippetStore).to.respondTo('add');
    expect(snippetStore).to.respondTo('get');
    expect(snippetStore).to.respondTo('set');
    expect(snippetStore).to.respondTo('getAsList');
    expect(snippetStore).to.respondTo('remove');
    expect(snippetStore).to.respondTo('reset');
    expect(snippetStore).to.respondTo('exists');
    expect(snippetStore).to.respondTo('getItemIndexById');
  });
});

describe('Virtual Domain Store', function() {
  it('Exposes the needed API', function(){
    expect(virtualDomainStore).to.respondTo('add');
    expect(virtualDomainStore).to.respondTo('get');
    expect(virtualDomainStore).to.respondTo('set');
    expect(virtualDomainStore).to.respondTo('getAsList');
    expect(virtualDomainStore).to.respondTo('remove');
    expect(virtualDomainStore).to.respondTo('reset');
    expect(virtualDomainStore).to.respondTo('exists');
    expect(virtualDomainStore).to.respondTo('getItemIndexById');
  });
});