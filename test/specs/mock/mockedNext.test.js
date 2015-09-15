var mockedNext = require('../../../src/lib/mock/mockedNext'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

describe('Mocked Next', function() {
  it('should have a promise', function() {
    var next = mockedNext();

    expect(next).to.have.ownProperty('promise');
    expect(next).to.respondTo('execute');
  });

  it('should resolve', function(done) {
    var next = mockedNext();

    next.execute({
      myThing: 'test'
    })
      .should.be.fulfilled
      .then(function(data) {
        expect(data.myThing).to.equals('test');
      })
      .should.notify(done);
  });

});