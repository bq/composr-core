var BaseDao = require('../../../src/lib/daos/BaseDao'),
  driverStore = require('../../../src/lib/stores/corbelDriver.store'),
  composrUtils = require('../../../src/lib/utils'),
  ComposrError = require('../../../src/lib/ComposrError'),
  chai = require('chai'),
  sinon = require('sinon'),
  corbel = require('corbel-js'),
  expect = chai.expect;

describe('BaseDao delete ', function() {
  this.timeout(30000);
  var theDao;

  beforeEach(function() {
    theDao = new BaseDao({
      collection : 'composr:Phrase'
    });
  });

  it('Returns a COMPOSR error', function(done) {
    var stubDelete = sinon.stub();
    stubDelete.onCall(0).returns(Promise.reject({
      status : 401,
      data: {
        name : 'test'
      }
    }));

    //Stub resources.resource
    var stubResource = sinon.stub();
    stubResource.returns({
      delete: stubDelete
    });

    driverStore.setDriver({
      resources: {
        resource: stubResource
      }
    });

    theDao.delete('theid')
      .catch(function(response) {
        expect(response).to.be.a.instanceof(ComposrError);
      })
      .should.notify(done);
  });

  it('Returns missing driver warning', function(done){
    driverStore.setDriver(null);

    theDao.delete({})
      .catch(function(err){
        expect(err).to.be.a('string');
        done();
      });
  });

  it('Resolves if the request works well', function(done){
    var stubDelete = sinon.stub();
    stubDelete.onCall(0).returns(Promise.resolve({
      data: {
        name : 'test'
      }
    }));

    //Stub resources.resource
    var stubResource = sinon.stub();
    stubResource.returns({
      delete: stubDelete
    });

    driverStore.setDriver({
      resources: {
        resource: stubResource
      }
    });

    theDao.delete({})
      .should.be.fulfilled.notify(done);
  });

});