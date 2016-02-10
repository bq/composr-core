var getComposrError = require('../../src/lib/getComposrError'),
chai = require('chai'),
chaiAsPromised = require('chai-as-promised'),
expect = chai.expect,
should = chai.should();

chai.use(chaiAsPromised);


describe('getComposrError', function() {

  it('Returns a correct composr error', function() {
    var theThing = {
      status: 301,
      error : 'mine',
      errorDescription : 'the errorDescription'
    };

    var myError = getComposrError(theThing);
    expect(myError.status).to.equals(301);
    expect(myError.error).to.equals('mine');
    expect(myError.errorDescription).to.equals('the errorDescription');
  });

});
