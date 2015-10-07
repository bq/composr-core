var loadPhrase = require('../../../src/lib/loaders/loadPhrase'),
  composrUtils = require('../../../src/lib/utils'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('loadPhrase', function() {

  var loader, stubResource, stubGetResource;

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

    loader = loadPhrase.bind({
      corbelDriver: {
        resources: {
          resource: stubResource
        }
      },
      resources: {
        phrasesCollection: 'testCol'
      },
      utils: composrUtils
    });
  });

  it('invokes the resources.resource', function(done) {
    loader('myId')
      .should.be.fulfilled
      .then(function(response) {
        expect(response.data.name).to.equals('test');
        expect(stubResource.calledOnce).to.equals(true);
        expect(stubResource.calledWith('testCol', 'myId')).to.equals(true);
        expect(stubGetResource.calledOnce).to.equals(true);
      })
      .should.notify(done);
  });

  it('rejects without id', function(done) {
    loader()
      .should.be.rejected.notify(done);
  });

  it('rejects if missing corbelDriver', function(done) {
    var loaderWithoutDriver = loadPhrase.bind({
      utils: composrUtils,
      resources: {
        phrasesCollection: 'testCol'
      }
    });
    
    loaderWithoutDriver()
      .should.be.rejected.notify(done);
  });


});