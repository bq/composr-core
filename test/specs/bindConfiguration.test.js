var bindConfiguration = require('../../src/lib/bindConfiguration'),
  chai = require('chai'),
  expect = chai.expect;


describe('bindConfiguration', function() {
  it('Has some default values', function() {
    var result = bindConfiguration();
    expect(result).to.be.an('object');
    expect(result.timeout).to.be.a('number');
    expect(result.timeout).to.equals(10000);
    expect(result).to.have.property('credentials');
    expect(result).to.have.property('urlBase');
  });

  it('Overwrites the default values', function() {
    var options = {
      timeout : 3000,
      urlBase : 'test',
      credentials : 'test'
    };

    var result = bindConfiguration(options);

    expect(result).to.be.an('object');
    expect(result.timeout).to.equals(3000);
    expect(result.urlBase).to.equals('test');
    expect(result.credentials).to.equals('test');
  });
});