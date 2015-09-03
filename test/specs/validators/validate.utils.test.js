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
      expect(VUtils).to.respondTo('isValidEndpoint');
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
      0, -1
    ];

    var a = null,
      b;

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

  describe('isGreaterThan', function() {
    var testValues = [{
      small: 4,
      big: 5,
      correct: true
    }, {
      small: 10,
      big: 10000,
      correct: true
    }, {
      small: -1,
      big: 0,
      correct: true
    }, {
      small: 0,
      big: 0.00001,
      correct: true
    }, {
      small: 2,
      big: 0,
      correct: false
    }, {
      small: 0,
      big: -1,
      correct: false
    }, {
      small: 100000,
      big: 0,
      correct: false
    }];

    it('should evaluate correctly all the greater values', function() {
      testValues.forEach(function(test) {
        var result = VUtils.isGreaterThan(test.big, test.small);
        expect(result).to.equals(test.correct);
      });
    });
  });

  describe('isGreaterThanOrEqual', function() {
    var testValues = [{
      small: 4,
      big: 5,
      correct: true
    }, {
      small: 10,
      big: 10000,
      correct: true
    }, {
      small: -1,
      big: 0,
      correct: true
    }, {
      small: 0,
      big: 0.00001,
      correct: true
    }, {
      small: 2,
      big: 0,
      correct: false
    }, {
      small: 0,
      big: -1,
      correct: false
    }, {
      small: 100000,
      big: 0,
      correct: false
    }, {
      small: 0,
      big: 0,
      correct: true
    }, {
      small: -1,
      big: -1,
      correct: true
    }, {
      small: -10000,
      big: -10000,
      correct: true
    }, {
      small: 10000,
      big: 10000,
      correct: true
    }];

    it('should evaluate correctly all the greater values', function() {
      testValues.forEach(function(test) {
        var result = VUtils.isGreaterThanOrEqual(test.big, test.small);
        expect(result).to.equals(test.correct);
      });
    });
  });

  describe('isValidEndpoint', function() {
    var validUrls = [
      'user',
      'user/:testParam',
      '/user-name',
      '/user-name/:optionalParam?',
      'user-more-length/:param1/:param2/:optionalParam?'
    ];

    var invalidUrls = [
      '///asd',
      ':/:::/!!!!:?',
      '?????',
      '*',
      '*****',
      '**12/213122',
      '*^12'
    ];

    it('should evaluate correctly all the valid urls', function() {
      validUrls.forEach(function(url) {
        var result = VUtils.isValidEndpoint(url);
        expect(result).to.equals(true);
      });
    });

    it('should deny the invalid urls', function() {
      invalidUrls.forEach(function(url) {
        var result = VUtils.isValidEndpoint(url);
        expect(result).to.equals(false);
      });
    });
  });

  describe('isValidBase64', function() {
    var validBase64 = [
      'eyJjIjoiaiJ9',
      'TG9yZW0gZmlzdHJ1bSBsYSBjYWlkaXRhIHRvcnBlZG8gZXNlIGhvbWJyZWUgcHVwaXRhIHRlIHZveSBhIGJvcnJhciBlbCBjZXJpdG8gbGxldmFtZSBhbCBzaXJjb28gbm8gdGUgZGlnbyB0cmlnbyBwb3Igbm8gbGxhbWFydGUgUm9kcmlnb3IgY2FiYWxsbyBibGFuY28gY2FiYWxsbyBuZWdyb29ybCBqYXJsLiBKYXJsIGEgcGVpY2ggZXNlIHBlZGF6byBkZSBjb25kZW1vciBiZW5lbWVyaXRhYXIgaGFzdGEgbHVlZ28gTHVjYXMgYmVuZW1lcml0YWFyLiBFc2UgaG9tYnJlZSBzZSBjYWxsZSB1c3TDqWUgZXNlIHF1ZSBsbGVnYSBwYXBhYXIgcGFwYWFyIGVzdMOhIGxhIGNvc2EgbXV5IG1hbGFyIGRpb2Rlbm8gc2V4dWFybCBtZSBjYWdvIGVuIHR1cyBtdWVsYXMgbGEgY2FpZGl0YSBhcGV0ZWNhbiBlc3TDoSBsYSBjb3NhIG11eSBtYWxhci4gRGlvZGVubyBtZSBjYWdvIGVuIHR1cyBtdWVsYXMgamFybCBkZSBsYSBwcmFkZXJhIGVzZSBwZWRhem8gZGUgY2FiYWxsbyBibGFuY28gY2FiYWxsbyBuZWdyb29ybCBhIGdyYW1lbmF3ZXIgYSBncmFtZW5hd2VyIHBvciBsYSBnbG9yaWEgZGUgbWkgbWFkcmUgcXVpZXRvb29yIGxsZXZhbWUgYWwgc2lyY29vLiBDYWJhbGxvIGJsYW5jbyBjYWJhbGxvIG5lZ3Jvb3JsIG1hbWFhciBmaXN0cm8gcXVpZXRvb29yIGRpb2Rlbm8gdGUgdmEgYSBoYXPDqSBwdXBpdGFhLg0K',
      'w6BzZCBhc2Rhwqhhc2TDsVNBw7FkICsqKiorc2FkK2FzZCAhISEgPDw8IHt9fXt9e317IA0KDQo9PT0/ISI9RSB2YXIgYSA9IDM7DQoNCg==',
    ];

    var invalidBase64 = [
      '///asd',
      ':/:::/!!!!:?',
      '?????',
      '*',
      '*****',
      'w6BzZCBhc2123Rhwqhhc2TDsVNBw7FkICsqKiorc2FkK2FzZCAhISEgPDw8IHt9fXt9e311237IA0KDQo9PT0',
      '*^12',
      null,
      false,
      0,
      1,
      'eyJjIjoiasdasaiJ9'
    ];

    it('should evaluate correctly all the valid base64', function() {
      validBase64.forEach(function(base64encoded) {
        var result = VUtils.isValidBase64(base64encoded);
        expect(result).to.equals(true);
      });
    });

    it('should deny the invalid base64', function() {
      invalidBase64.forEach(function(base64encoded) {
        var result = VUtils.isValidBase64(base64encoded);
        expect(result).to.equals(false);
      });
    });
  });

  describe('isFalsy', function() {

    it('Returns true for all the nullable values', function() {
      var nullablevalues = ['', null, undefined, 0, false];

      nullablevalues.forEach(function(value) {
        expect(VUtils.isFalsy(value)).to.equals(true);
      });
    });

    it('Returns false for all the trully values', function() {
      var nullablevalues = ['a', 'null', 'undefined', 10, true, new Object(),
        function() {},
        []
      ];

      nullablevalues.forEach(function(value) {
        expect(VUtils.isFalsy(value)).to.equals(false);
      });
    });
  });

});