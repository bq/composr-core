var loadSnippet = require('../../../src/lib/loaders/loadSnippet'),
  composrUtils = require('../../../src/lib/utils'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('loadSnippet', function() {

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

    loader = loadSnippet.bind({
      corbelDriver: {
        resources: {
          resource: stubResource
        }
      },
      resources: {
        snippetsCollection: 'testCol'
      },
      utils: composrUtils
    });
  });

  it('invokes the resources.resource', function(done) {
    loader('myId')
      .should.be.fulfilled
      .then(function(item) {
        expect(item.name).to.equals('test');
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
    var loaderWithoutDriver = loadSnippet.bind({
      utils: composrUtils,
      resources: {
        snippetsCollection: 'testCol'
      }
    });
    
    loaderWithoutDriver()
      .should.be.rejected.notify(done);
  });


});