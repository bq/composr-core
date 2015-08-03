var VUtils = require('../../../src/lib/validators/validate.utils.js'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('Validator utils', function() {
  describe('validator API', function(){

    it('has the expected methods', function(){
      expect(VUtils).to.respondTo('isDefined');
      expect(VUtils).to.respondTo('isDefined');
      expect(VUtils).to.respondTo('failIfIsDefined');
      expect(VUtils).to.respondTo('isNotNull');
      expect(VUtils).to.respondTo('isValue');
      expect(VUtils).to.respondTo('isGreaterThan');
      expect(VUtils).to.respondTo('isGreaterThanOrEqual');
      expect(VUtils).to.respondTo('isValidUrl');
      expect(VUtils).to.respondTo('isValidBase64');
    });
  });

  describe('isDefined', function(){
    var areDefined = [
      1,
      'asd',
      new Object(),
      false,
      0,
      null
    ];

    var a;

    var areNotDefined = [
      undefined,
      a
    ];

    it('Returns true for the defined values', function(){

      var areAllDefined = areDefined.reduce(function(prev, next){
        return prev && VUtils.isDefined(next);
      }, true);

      expect(areAllDefined).to.equals(true);
    });

    it('Returns false for the unddefined values', function(){

      var areAllFalsy = areNotDefined.reduce(function(prev, next){
        return prev === true && VUtils.isDefined(next) === false;
      }, true);

      expect(areAllFalsy).to.equals(true);
    });

  });

});