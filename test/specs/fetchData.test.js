var composr = require('../../src/composr-core'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var utilsPromises = require('../utils/promises');

describe('fetchData method', function() {

  var stubFetchVirtualDomains;

  before(function() {
    stubFetchVirtualDomains = sinon.stub(composr.virtualDomainDao, 'loadAll', utilsPromises.resolvedCurriedPromise(['test']));
  });

  after(function() {
    stubFetchVirtualDomains.restore();
  });

  it('Resolves correctly', function(done) {
    composr.fetchData()
      .should.be.fulfilled
      .then(function() {
        expect(composr.data.phrases).to.exist;
        expect(composr.data.snippets).to.exist;
        expect(composr.data.phrases[0]).to.equals('test');
        expect(composr.data.snippets[0]).to.equals('test');

      }).should.notify(done);
  });

});

describe('fail fetchData', function() {
  var stubFetchVirtualDomains;

  it('fails if loadPhrases fails', function(done) {
    stubFetchVirtualDomains = sinon.stub(composr.virtualDomainDao, 'loadAll', utilsPromises.rejectedPromise);

    composr.fetchData().should.be.rejected.notify(done);
  });

  afterEach(function() {
    stubFetchVirtualDomains.restore();
  });
});