var phraseStore = require('../../../src/lib/stores/phrases.store'),
  PhraseModel = require('../../../src/lib/models/PhraseModel'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

var phrasesFixtures = require('../../fixtures/phrases');

describe('Phrase Store', function() {

  it('Exposes the needed API', function(){
    expect(phraseStore).to.respondTo('add');
    expect(phraseStore).to.respondTo('get');
    expect(phraseStore).to.respondTo('set');
    expect(phraseStore).to.respondTo('getAsList');
    expect(phraseStore).to.respondTo('remove');
    expect(phraseStore).to.respondTo('reset');
    expect(phraseStore).to.respondTo('exists');
    expect(phraseStore).to.respondTo('_getPhraseIndexById');
  });
  
  describe('Get as list', function(){
    beforeEach(function() {
      phraseStore.set({
        'testdomain': [{
          id: 'loginclient!:id!:name'
        }, {
          id: 'user'
        }],
        'other:domain': [{
          id: 'test-endpoint-a'
        }, {
          id: 'register/user/:email'
        }, {
          id: 'register/user/:email/2'
        }]
      });
    });

    afterEach(function() {
      phraseStore.reset();
    });

    it('returns all the phrases for all the domains if no domain is provided', function() {
      var candidates = phraseStore.getAsList(null);
      expect(candidates.length).to.equals(5);
    });

    it('returns all the phrases for a single domain', function() {
      var candidates = phraseStore.getAsList('other:domain');
      expect(candidates.length).to.equals(3);
    });

     it('Returns an empty list for a missing domain', function() {
      var candidates = phraseStore.getAsList('no:domain');
      expect(candidates.length).to.equals(3);
    });
  });

  describe('Get phrase index by id', function() {

    beforeEach(function() {
      var items = [{
        url : 'example/test',
        domain : 'my:domain:1'
      },{
        url : 'example/test/2',
        domain : 'my:domain:1'
      },{
        url : 'example/test',
        domain : 'my:domain:2'
      },{
        url : 'example/test/test',
        domain : 'my:domain:2'
      },{
        url : 'example/test',
        domain : 'my:domain:3'
      }];

      items.forEach(function(item){
        var model = new PhraseModel(item, item.domain);
        phraseStore.add(item.domain, model);
      });
    });

    afterEach(function() {
      phraseStore.reset();
    });

    it('should return -1 if the phrase is not found', function() {
      var result = phraseStore._getPhraseIndexById('my:domain:1', 'asdfg');
      expect(result).to.equals(-1);
    });

    it('should return the index of the phrase in the domain list', function() {
      var result = phraseStore._getPhraseIndexById('my:domain:1', 'my:domain:1!example!test');
      expect(result).to.equals(0);
    });

    it('should return the index of the phrase on another domain', function() {
      var result = phraseStore._getPhraseIndexById('my:domain:2', 'my:domain:2!example!test');
      expect(result).to.equals(0);
    });

    it('should return the index of the phrase on the full list if no domain was provided', function() {
      var result = phraseStore._getPhraseIndexById(null, 'my:domain:2!example!test');
      expect(result).to.equals(2);
    });

  });

  describe('Get phrases by id', function() {

    beforeEach(function() {
      var items = [{
        url : 'example/test',
        version : '1',
        domain : 'my:domain:1'
      },{
        url : 'example/test/2',
        version : '1',
        domain : 'my:domain:1'
      },{
        url : 'example/test',
        version : '1',
        domain : 'my:domain:2'
      },{
        url : 'example/test/test',
        version : '1',
        domain : 'my:domain:2'
      },{
        url : 'example/test',
        version : '1',
        domain : 'my:domain:3'
      }];

      items.forEach(function(item){
        var model = new PhraseModel(item, item.domain);
        phraseStore.add(item.domain, model);
      });
    });

    afterEach(function() {
      phraseStore.reset();
    });
    
    it('should return null if no domain and no id is passed', function() {
      var phrase = phraseStore.get();
      expect(phrase).to.equals(null);
    });

    it('should return null if no id is passed', function() {
      var phrase = phraseStore.get('other:domain');
      expect(phrase).to.equals(null);
    });

    it('should return the first matching phrase if no domain is passed', function() {
      var phrase = phraseStore.get('', 'my:domain:1!example!test-1');
      expect(phrase).to.be.an('object');
      expect(phrase.getId()).to.equals('my:domain:1!example!test-1');
      expect(phrase.getUrl()).to.equals('example/test');
    });

    it('should return the correct matching phrase if a domain is passed', function() {
      var phrase = phraseStore.get('my:domain:2', 'my:domain:2!example!test-1');
      expect(phrase).to.be.an('object');
      expect(phrase.getId()).to.equals('my:domain:2!example!test-1');
      expect(phrase.getUrl()).to.equals('example/test');
    });

    it('should not return phrases if the domain is wrong', function() {
      var phrase = phraseStore.get('my-domain-not-existing', 'my:domain:1!example!test-1');
      expect(phrase).to.be.a('null');
    });

    it('should not return any phrase if id is wrong', function() {
      var phraseObtained = phraseStore.get('my:domain:2', 'test-test-test-1');
      expect(phraseObtained).to.be.a('null');
    });

  });

/* ADD 
describe('Add to list', function() {

    beforeEach(function() {
      Phrases.resetItems();
    });

    it('Adds a phrase with a domain', function() {
      var added = Phrases._addToList('addtolist:domain', {
        id: 'serious-phrase',
        value: 'serious'
      });

      expect(Phrases.getPhrases('addtolist:domain').length).to.equals(1);
      expect(Phrases.getById('addtolist:domain', 'serious-phrase')).to.be.an('object');
      expect(Phrases.getById('addtolist:domain', 'serious-phrase')).to.include.keys(
        'id',
        'value'
      );
      expect(added).to.equals(true);
    });

    it('Does not add an empty phrase', function() {
      var added = Phrases._addToList('addtolist:domain', null);

      expect(Phrases.getPhrases('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add non objects', function() {
      var added = Phrases._addToList('addtolist:domain', 'Hey');

      expect(Phrases.getPhrases('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add a phrase without id', function() {
      var added = Phrases._addToList('addtolist:domain', {});

      expect(Phrases.getPhrases('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

  });*/
});