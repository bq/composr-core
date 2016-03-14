var BaseDao = require('../../../src/lib/daos/BaseDao'),
  driverStore = require('../../../src/lib/stores/corbelDriver.store'),
  composrUtils = require('../../../src/lib/utils'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('BaseDao LoadAll', function() {

  var theDao, stubCollection, stubGetCollection;

  beforeEach(function() {

    //Stub collection get
    stubGetCollection = sinon.stub();
    stubGetCollection.onCall(0).returns(Promise.resolve({
      data: Array(30),
      status: 200
    }));

    stubGetCollection.onCall(1).returns(Promise.resolve({
      status: 200,
      data: Array(10)
    }));

    //Stub resource.collection
    stubCollection = sinon.stub();
    stubCollection.returns({
      get: stubGetCollection
    });

    driverStore.setDriver({
      resources: {
        collection: stubCollection
      }
    });

    theDao = new BaseDao({
      collection : 'my:collection'
    });
  });

  it('invokes the resources.collection as long as it has items', function(done) {
    theDao.loadAll()
      .should.be.fulfilled
      .then(function() {
        expect(stubCollection.calledTwice).to.equals(true);
        expect(stubCollection.calledWith('my:collection')).to.equals(true);
        expect(stubGetCollection.calledTwice).to.equals(true);
      })
      .should.notify(done);
  });

  it('rejects if missing corbelDriver', function(done) {
    driverStore.setDriver(null);

    theDao.loadAll()
      .should.be.rejected.notify(done);
  });
});