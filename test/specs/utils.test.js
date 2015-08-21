var utils = require('../../src/lib/utils'),
  chai = require('chai'),
  q = require('q'),
  corbel = require('corbel-js'),
  expect = chai.expect;


describe('utils', function() {
  describe('getAllRecursively', function(){

    var caller = function(maxPages){
      return function(pageNumber, pageSize) {
        var items = [];
        if(pageNumber < maxPages){
          for(var i = 0; i < pageSize; i++){
            items.push((pageNumber * pageSize) + i);
          }
        }
        return q.resolve({
          data : items,
          status : 200
        });
      };
    }

    it('fetches all the items with 3 pages', function(done){
      utils.getAllRecursively(caller(3))
        .then(function(items){
          expect(items.length).to.equals(60);
          done();
        });
    });

    it('fetches all the items with 4 pages', function(done){
      utils.getAllRecursively(caller(4))
        .then(function(items){
          expect(items.length).to.equals(80);
          done();
        });
    });

    it('allows to specify starting page', function(done){
      utils.getAllRecursively(caller(4), 1, 10)
        .then(function(items){
          expect(items.length).to.equals(30);
          done();
        });
    });

    it('allows to specify items per page', function(done){
      utils.getAllRecursively(caller(4), 0, 10)
        .then(function(items){
          expect(items.length).to.equals(40);
          done();
        });
    });

  });

  describe('Extract domain', function(){
    var credentials = {
      'iss': '1',
      'domainId' : 'test',
      'aud' : '2',
      'scope' : '3'
    };

    var accesToken = corbel.jwt.generate(credentials, 'secret');

    it('extracts the correct domain', function(){
      var domain = utils.extractDomain(accesToken);
      expect(domain).to.equals('test');
    });
  });

  describe('Values', function(){

    describe('isNully', function(){

      it('Returns true for all the nullable values', function(){
        var nullablevalues = ['', null, undefined, 0, false];

        nullablevalues.forEach(function(value){
          expect(utils.values.isNully(value)).to.equals(true);
        });
      });

      it('Returns false for all the trully values', function(){
        var nullablevalues = ['a', 'null', 'undefined', 10, true, new Object(), function(){}, []];

        nullablevalues.forEach(function(value){
          expect(utils.values.isNully(value)).to.equals(false);
        });
      });
    });

  });

});