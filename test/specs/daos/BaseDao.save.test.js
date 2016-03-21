var BaseDao = require('../../../src/lib/daos/BaseDao'),
  driverStore = require('../../../src/lib/stores/corbelDriver.store'),
  composrUtils = require('../../../src/lib/utils'),
  ComposrError = require('../../../src/lib/ComposrError'),
  chai = require('chai'),
  sinon = require('sinon'),
  corbel = require('corbel-js'),
  expect = chai.expect;

describe('BaseDao save ', function() {
  this.timeout(10000);
  var theDao;

  beforeEach(function() {

    
    
    theDao = new BaseDao({
      collection : 'composr:Phrase'
    });
  });

  it('Returns a COMPOSR error', function(done) {
    driverStore.setDriver(corbel.getDriver({
      urlBase : 'https://proxy-qa.bqws.io/{{module}}/v1.0/',
      "clientId": "xxx",
      "clientSecret": "xxx",
      "scopes": "composr:comp:admin"
    }));

    theDao.save({
      id : 'not-save',
    })
      .catch(function(response) {
        expect(response).to.be.a.instanceof(ComposrError);
      })
      .should.notify(done);
  });

  it('Returns missing driver warning', function(done){
    driverStore.setDriver(null);

    theDao.save({})
      .catch(function(err){
        expect(err).to.be.a('string');
        done();
      });
  });

  it('Resolves if the request works well', function(done){
    var stubUpdate = sinon.stub();
    stubUpdate.onCall(0).returns(Promise.resolve({
      data: {
        name : 'test'
      }
    }));

    //Stub resources.resource
    var stubResource = sinon.stub();
    stubResource.returns({
      update: stubUpdate
    });

    driverStore.setDriver({
      resources: {
        resource: stubResource
      }
    });

    theDao.save({})
      .should.be.fulfilled.notify(done);
  });

});