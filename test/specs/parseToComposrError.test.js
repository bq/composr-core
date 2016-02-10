var parseToComposrError = require('../../src/lib/parseToComposrError'),
chai = require('chai'),
chaiAsPromised = require('chai-as-promised'),
expect = chai.expect,
should = chai.should();

chai.use(chaiAsPromised);


describe('parseToComposrError', function() {

  it('Returns a correct composr error', function() {
    var theThing = {
      status: 301,
      error : 'mine',
      errorDescription : 'the errorDescription'
    };

    var myError = parseToComposrError(theThing);
    expect(myError.status).to.equals(301);
    expect(myError.error).to.equals('mine');
    expect(myError.errorDescription).to.equals('the errorDescription');
  });  

  it('Returns a correct composr error with default error', function() {
    var theThing = {
      iam: 'awesome'
    };

    var myError = parseToComposrError(theThing, 'default:error');
    expect(myError.status).to.equals(500);
    expect(myError.error).to.equals('default:error');
    expect(myError.errorDescription).to.include.keys('iam');
  });

});
