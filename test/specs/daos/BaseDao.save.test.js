var BaseDao = require('../../../src/lib/daos/BaseDao'),
  driverStore = require('../../../src/lib/stores/corbelDriver.store'),
  composrUtils = require('../../../src/lib/utils'),
  ComposrError = require('../../../src/lib/ComposrError'),
  chai = require('chai'),
  sinon = require('sinon'),
  corbel = require('corbel-js'),
  expect = chai.expect;

describe('BaseDao save', function() {
  this.timeout(10000);
  var theDao, stubResource, stubGetResource;

  beforeEach(function() {

    //Stub collection get
    /*stubGetResource = sinon.stub();
    stubGetResource.onCall(0).returns(Promise.resolve({
      data: {
        name : 'test'
      }
    }));

    //Stub resources.resource
    stubResource = sinon.stub();
    stubResource.returns({
      get: stubGetResource
    });*/

    driverStore.setDriver(corbel.getDriver({
      urlBase : 'https://proxy-qa.bqws.io/{{module}}/v1.0/',
      "clientId": "xxx",
      "clientSecret": "xxx",
      "scopes": "composr:comp:admin"
    }));

    theDao = new BaseDao({
      collection : 'composr:Phrase'
    });
  });

  it('Returns a COMPOSR error', function(done) {
    theDao.save({
      id : 'not-save',
    })
      .catch(function(response) {
        expect(response).to.be.a.instanceof(ComposrError);
      })
      .should.notify(done);
  });

});