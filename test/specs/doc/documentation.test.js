'use strict';

var documentation = require('../../../src/lib/doc/documentation'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var correctPhrases = require('../../fixtures/phrases').correct;

describe('Documentation', function() {

  it('Compiles correctly', function(done) {
    documentation.bind({
      config: {
        urlBase: 'test'
      }
    })(correctPhrases)
      .then(function(result) {
        expect(result).to.be.a('string');
        expect(result.indexOf('DOCTYPE') !== -1).to.equals(true);
      }).should.be.fulfilled.notify(done);
  });

});