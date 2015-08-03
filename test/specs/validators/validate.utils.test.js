var VUtils = require('../../../src/lib/validators/validate.utils.js'),
  chai = require('chai'),
  sinon = require('sinon'),
  expect = chai.expect;

describe('Validator utils', function() {
  describe('validator API', function() {

    it('has the expected methods', function() {
      expect(VUtils).to.respondTo('isDefined');
      expect(VUtils).to.respondTo('isNotNull');
      expect(VUtils).to.respondTo('isValue');
      expect(VUtils).to.respondTo('isGreaterThan');
      expect(VUtils).to.respondTo('isGreaterThanOrEqual');
      expect(VUtils).to.respondTo('isValidUrl');
      expect(VUtils).to.respondTo('isValidBase64');
    });
  });

  describe('isDefined', function() {
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

    it('Returns true for the defined values', function() {

      var areAllDefined = areDefined.reduce(function(prev, next) {
        return prev && VUtils.isDefined(next);
      }, true);

      expect(areAllDefined).to.equals(true);
    });

    it('Returns false for the unddefined values', function() {

      var areAllFalsy = areNotDefined.reduce(function(prev, next) {
        return prev === true && VUtils.isDefined(next) === false;
      }, true);

      expect(areAllFalsy).to.equals(true);
    });

  });

  describe('isNotNull', function() {
    var areNotNull = [
      1,
      'asd',
      new Object(),
      false,
      0,
      undefined, -1
    ];

    var a = null;

    var areNull = [
      null,
      a
    ];

    it('Returns true for the values', function() {

      var noOneNull = areNotNull.reduce(function(prev, next) {
        return prev && VUtils.isNotNull(next);
      }, true);

      expect(noOneNull).to.equals(true);
    });

    it('Returns false for the nully values', function() {

      var areAllFalsy = areNull.reduce(function(prev, next) {
        return prev === true && VUtils.isNotNull(next) === false;
      }, true);

      expect(areAllFalsy).to.equals(true);
    });
  });

  describe('isValue', function() {
    var areValue = [
      1,
      'asd',
      new Object(),
      false,
      0,
      -1
    ];

    var a = null, b;

    var arentValue = [
      null,
      a,
      b,
      undefined
    ];

    it('Returns true for the values', function() {

      var areAllValue = areValue.reduce(function(prev, next) {
        return prev && VUtils.isValue(next);
      }, true);

      expect(areAllValue).to.equals(true);
    });

    it('Returns false for the nully values', function() {

      var areAllFalsy = arentValue.reduce(function(prev, next) {
        return prev === true && VUtils.isValue(next) === false;
      }, true);

      expect(areAllFalsy).to.equals(true);
    });
  });

  describe('isGreaterThan', function(){
    var testValues = [{
      small: 4,
      big : 5,
      correct : true
    },{
      small: 10,
      big : 10000,
      correct : true
    },{
      small: -1,
      big : 0,
      correct : true
    },{
      small: 0,
      big : 0.00001,
      correct : true
    },{
      small: 2,
      big : 0,
      correct : false
    },{
      small: 0,
      big : -1,
      correct : false
    },{
      small: 100000,
      big : 0,
      correct : false
    }];

    it('should evaluate correctly all the greater values', function(){
      testValues.forEach(function(test){
        var result = VUtils.isGreaterThan(test.big, test.small);
        expect(result).to.equals(test.correct);
      });
    });
  });

});