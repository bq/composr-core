var BaseDao = require('../../../src/lib/daos/BaseDao'),
  driverStore = require('../../../src/lib/stores/corbelDriver.store'),
  composrUtils = require('../../../src/lib/utils'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('BaseDao load', function() {
  var theDao, stubResource, stubGetResource;

  beforeEach(function() {

    //Stub collection get
    stubGetResource = sinon.stub();
    stubGetResource.onCall(0).returns(Promise.resolve({
      data: {
        name : 'test'
      }
    }));

    //Stub resources.resource
    stubResource = sinon.stub();
    stubResource.returns({
      get: stubGetResource
    });

    driverStore.setDriver({
      resources: {
        resource: stubResource
      }
    });

    theDao = new BaseDao({
      collection : 'my:collection'
    });
  });

  it('invokes the resources.resource', function(done) {
    theDao.load('myId')
      .should.be.fulfilled
      .then(function(item) {
        expect(item.name).to.equals('test');
        expect(stubResource.calledOnce).to.equals(true);
        expect(stubResource.calledWith('my:collection', 'myId')).to.equals(true);
        expect(stubGetResource.calledOnce).to.equals(true);
      })
      .should.notify(done);
  });

  it('rejects without id', function(done) {
    theDao.load()
      .should.be.rejected.notify(done);
  });

  it('rejects if missing corbelDriver', function(done) {
    driverStore.setDriver(null);

    theDao.load('myId')
      .should.be.rejected.notify(done);
  });
});