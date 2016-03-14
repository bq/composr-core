var BaseStore = require('../../../src/lib/stores/BaseStore'),
  PhraseModel = require('../../../src/lib/models/PhraseModel'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;


describe('Base Store', function() {
  var theStore;

  beforeEach(function(){
    theStore = new BaseStore();
  });

  it('Exposes the needed API', function(){
    expect(theStore).to.respondTo('add');
    expect(theStore).to.respondTo('get');
    expect(theStore).to.respondTo('set');
    expect(theStore).to.respondTo('getAsList');
    expect(theStore).to.respondTo('getItemIndexById');
    expect(theStore).to.respondTo('remove');
    expect(theStore).to.respondTo('reset');
    expect(theStore).to.respondTo('exists');
  });
  
  describe('Get as list', function(){
    beforeEach(function() {
      theStore.set({
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
      theStore.reset();
    });

    it('returns all the items for all the domains if no domain is provided', function() {
      var candidates = theStore.getAsList(null);
      expect(candidates.length).to.equals(5);
    });

    it('returns all the items for a single domain', function() {
      var candidates = theStore.getAsList('other:domain');
      expect(candidates.length).to.equals(3);
    });

     it('Returns an empty list for a missing domain', function() {
      var candidates = theStore.getAsList('no:domain');
      expect(candidates.length).to.equals(0);
    });
  });

  describe('Get item index by id', function() {

    beforeEach(function() {
      var items = [{
        url : 'example/test',
        domain : 'my:domain:1',
        version : '1.2.1'
      },{
        url : 'example/test/2',
        domain : 'my:domain:1',
        version : '1.2.1'
      },{
        url : 'example/test',
        domain : 'my:domain:2',
        version : '1.2.1'
      },{
        url : 'example/test/test',
        domain : 'my:domain:2',
        version : '1.2.1'
      },{
        url : 'example/test',
        domain : 'my:domain:3',
        version : '1.2.1'
      }];

      items.forEach(function(item){
        var model = new PhraseModel(item, item.domain);
        theStore.add(item.domain, model);
      });
    });

    afterEach(function() {
      theStore.reset();
    });

    it('should return -1 if the item is not found', function() {
      var result = theStore.getItemIndexById('my:domain:1', 'asdfg');
      expect(result).to.equals(-1);
    });

    it('should return the index of the item in the domain list', function() {
      var result = theStore.getItemIndexById('my:domain:1', 'my:domain:1!example!test-1.2.1');
      expect(result).to.equals(0);
    });

    it('should return the index of the item on another domain', function() {
      var result = theStore.getItemIndexById('my:domain:2', 'my:domain:2!example!test-1.2.1');
      expect(result).to.equals(0);
    });

    it('should return the index of the item on the full list if no domain was provided', function() {
      var result = theStore.getItemIndexById(null, 'my:domain:2!example!test-1.2.1');
      expect(result).to.equals(2);
    });

  });

  describe('Get items by id', function() {

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
        theStore.add(item.domain, model);
      });
    });

    afterEach(function() {
      theStore.reset();
    });
    
    it('should return null if no domain and no id is passed', function() {
      var item = theStore.get();
      expect(item).to.equals(null);
    });

    it('should return null if no id is passed', function() {
      var item = theStore.get('other:domain');
      expect(item).to.equals(null);
    });

    it('should return the first matching item if no domain is passed', function() {
      var item = theStore.get('', 'my:domain:1!example!test-1');
      expect(item).to.be.an('object');
      expect(item.getId()).to.equals('my:domain:1!example!test-1');
      expect(item.getUrl()).to.equals('example/test');
    });

    it('should return the correct matching item if a domain is passed', function() {
      var item = theStore.get('my:domain:2', 'my:domain:2!example!test-1');
      expect(item).to.be.an('object');
      expect(item.getId()).to.equals('my:domain:2!example!test-1');
      expect(item.getUrl()).to.equals('example/test');
    });

    it('should not return items if the domain is wrong', function() {
      var item = theStore.get('my-domain-not-existing', 'my:domain:1!example!test-1');
      expect(item).to.be.a('null');
    });

    it('should not return any item if id is wrong', function() {
      var itemObtained = theStore.get('my:domain:2', 'test-test-test-1');
      expect(itemObtained).to.be.a('null');
    });

  });

/* ADD 
describe('Add to list', function() {

    beforeEach(function() {
      items.resetItems();
    });

    it('Adds a item with a domain', function() {
      var added = items._addToList('addtolist:domain', {
        id: 'serious-item',
        value: 'serious'
      });

      expect(items.getitems('addtolist:domain').length).to.equals(1);
      expect(items.getById('addtolist:domain', 'serious-item')).to.be.an('object');
      expect(items.getById('addtolist:domain', 'serious-item')).to.include.keys(
        'id',
        'value'
      );
      expect(added).to.equals(true);
    });

    it('Does not add an empty item', function() {
      var added = items._addToList('addtolist:domain', null);

      expect(items.getitems('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add non objects', function() {
      var added = items._addToList('addtolist:domain', 'Hey');

      expect(items.getitems('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

    it('Does not add a item without id', function() {
      var added = items._addToList('addtolist:domain', {});

      expect(items.getitems('addtolist:domain')).to.be.a('null');
      expect(added).to.equals(false);
    });

  });*/
});