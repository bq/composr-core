'use strict';

var chai = require('chai'),
  expect = chai.expect,
  validator = require('../../../src/lib/validators/virtualDomain.validator')


describe('Validate Virtual Domain', function () {

  it('when something is wrong', function (done) {

    // 3 errors: name too short, no version, validate_middleware not a boolean
    var domain = {
      'id': 'xxx',
      'name': 'co',
      'git': '',
      'mock_middleware': false,
      'validate_middleware': 'wrong',
      'vd_dependencies': {},
      '_apiRML': {}
    }


    validator.validate(domain)
      .then(function () {
        done('Validation error should have been thrown')
      })
      .catch(function (errors) {
        expect(errors.length).to.be.equal(3)
        done()
      })

  });

  it('when it is ok', function (done) {

    var domain = {
      'id': 'xxx',
      'name': 'composr-cli',
      'author': 'jorge-serrano',
      'version': '1.0.0',
      'source_location': './src',
      'git': '',
      'license': 'MIT',
      'mock_middleware': false,
      'validate_middleware': true,
      'vd_dependencies': {},
      '_apiRML': {}
    }

    validator.validate(domain)
      .then(function () {
        done();
      })
      .catch(function (errors) {
        done(errors)
      })

  });

});
