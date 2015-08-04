'use strict';

var ramlCompiler = require('../../../src/lib/compilers/raml.compiler'),
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);

var correctPhrases = require('../../fixtures/phrases').correct;

describe('Raml Compiler', function() {

  it('Compiles correctly', function(done) {
    ramlCompiler.compile(correctPhrases)
      .then(function(result) {
        expect(result).to.be.an('object');
        expect(result).to.include.keys(
          'title',
          'baseUri',
          'securitySchemes',
          'resourceTypes',
          'protocols',
          'resources'
        );
      }).should.be.fulfilled.notify(done);
  });

});