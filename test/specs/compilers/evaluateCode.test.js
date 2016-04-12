 var evaluateCode = require('../../../src/lib/compilers/evaluateCode'),
  chai = require('chai'),
  expect = chai.expect;

 describe('Code evaluation', function() {
  it('should evaluate a function', function() {
    var result = evaluateCode('console.log(a);');
    expect(result.fn).to.be.a('function');
    expect(typeof result.script).to.equals('object');
    expect(result.error).to.equals(false);
  });

  it('fails with a wrong code', function() {
    var result = evaluateCode('};');
    expect(result.fn).to.equals(null);
    expect(result.error).to.not.equals(false);
  });
});