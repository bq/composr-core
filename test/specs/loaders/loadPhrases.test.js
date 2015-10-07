var loadPhrases = require('../../../src/lib/loaders/loadPhrases'),
  composrUtils = require('../../../src/lib/utils'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('loadPhrases', function() {

  var loader, stubCollection, stubGetCollection;

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

    loader = loadPhrases.bind({
      corbelDriver: {
        resources: {
          collection: stubCollection
        }
      },
      resources: {
        phrasesCollection: 'testCol'
      },
      utils: composrUtils
    });
  });

  it('invokes the resources.collection as long as it has items', function(done) {
    loader()
      .should.be.fulfilled
      .then(function() {
        expect(stubCollection.calledTwice).to.equals(true);
        expect(stubCollection.calledWith('testCol')).to.equals(true);
        expect(stubGetCollection.calledTwice).to.equals(true);
      })
      .should.notify(done);
  });

  it('rejects if missing corbelDriver', function(done) {
    var loaderWithoutDriver = loadPhrases.bind({
      utils: composrUtils,
      resources: {
        phrasesCollection: 'testCol'
      }
    });

    loaderWithoutDriver()
      .should.be.rejected.notify(done);
  });


});