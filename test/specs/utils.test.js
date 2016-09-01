var utils = require('../../src/lib/utils'),
  chai = require('chai'),
  q = require('q'),
  corbel = require('corbel-js'),
  expect = chai.expect;


describe('utils', function() {
  describe('getAllRecursively', function() {

    var caller = function(maxPages) {
      return function(pageNumber, pageSize) {
        var items = [];
        if (pageNumber < maxPages) {
          for (var i = 0; i < pageSize; i++) {
            items.push((pageNumber * pageSize) + i);
          }
        }
        return q.resolve({
          data: items,
          status: 200
        });
      };
    }

    it('fetches all the items with 3 pages', function(done) {
      utils.getAllRecursively(caller(3))
        .then(function(items) {
          expect(items.length).to.equals(60);
          done();
        });
    });

    it('fetches all the items with 4 pages', function(done) {
      utils.getAllRecursively(caller(4))
        .then(function(items) {

          expect(items.length).to.equals(80);
          done();
        });
    });

    it('allows to specify starting page', function(done) {
      utils.getAllRecursively(caller(4), 1, 10)
        .then(function(items) {
          expect(items.length).to.equals(30);
          done();
        });
    });

    it('allows to specify items per page', function(done) {
      utils.getAllRecursively(caller(4), 0, 10)
        .then(function(items) {
          expect(items.length).to.equals(40);
          done();
        });
    });

  });

  describe('Extract domain', function() {
    var accesToken = 'eyJ0eXBlIjoiVE9LRU4iLCJjbGllbnRJZCI6IjU0MzgyMzA3Iiwic3RhdGUiOiIxNDcyNjM2Mjk5MDAwIiwiZG9tYWluSWQiOiJib29xczpudWJpY286ZXMifQ.53cb1bb3d7b17.cvSw0NWicSL7UOuqymAvADHQlWA';
    it('extracts the correct domain', function() {
      var domain = utils.extractDomain(accesToken);
      expect(domain).to.equals('booqs:nubico:es');
    });
  });


  describe('Base64 decode / encode', function() {
    var code = 'console.log("asdsa")';

    it('decodes it correctly', function() {
      var encoded = utils.encodeToBase64(code);
      var decoded = utils.decodeFromBase64(encoded);
      expect(decoded).to.equals(code);
    });
  });

});