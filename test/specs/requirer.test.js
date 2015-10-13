var composr = require('../../src/composr-core'),
  _ = require('lodash'),
  chai = require('chai'),
  sinon = require('sinon'),
  utils = require('../../src/lib/utils'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiAsPromised);


describe('Requirer', function() {

  var snippets = [{
    id: 'DOMAIN!TheSnippet1',
    codehash: utils.encodeToBase64('var userModel = function(id){ this.id = id; }; exports(userModel);')
  }, {
    id: 'DOMAIN!TheSnippet2',
    codehash: utils.encodeToBase64('exports(1);')
  }, {
    id: 'DOMAIN!TheSnippet3',
    codehash: utils.encodeToBase64('exports("My test");')
  }, {
    id: 'DOMAIN!TheSnippet4',
    codehash: utils.encodeToBase64('exports(1);')
  }, {
    id: 'DOMAIN!TheSnippet5',
    codehash: utils.encodeToBase64('exports(1);')
  }, {
    id: 'DOMAIN!TheSnippet6',
    codehash: utils.encodeToBase64('exports(1);')
  }];

  before(function(done) {
    composr.config = composr.bindConfiguration({
      urlBase: 'http://internet.com'
    });

    composr.requirer.configure(composr.config);

    var snippetsDomainOne = _.take(snippets, 3).map(function(snippet) {
      snippet.id = snippet.id.replace('DOMAIN', 'testDomain');
      return snippet;
    });

    var snippetsDomainTwo = _.takeRight(snippets, 6).map(function(snippet) {
      snippet.id = snippet.id.replace('DOMAIN', 'otherDomain');
      return snippet;
    });

    composr.Snippets.register('testDomain', snippetsDomainOne)
      .should.be.fulfilled
      .then(function() {
        return composr.Snippets.register('otherDomain', snippetsDomainTwo);
      })
      .should.be.fulfilled.notify(done);

  });

  it('Has the expected API', function() {
    expect(composr.requirer).to.respondTo('configure');
    expect(composr.requirer).to.respondTo('forDomain');
  });

  it('Can require all the allowed libraries', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var ALLOWED_LIBRARIES = ['q', 'async', 'request', 'corbel-js', 'lodash', 'http', 'ComposrError', 'composrUtils'];

    var requiredLibraries = ALLOWED_LIBRARIES.map(function(lib) {
      return requirerMethod(lib);
    });

    requiredLibraries.forEach(function(lib) {
      expect(lib).to.exist;
    });
  });

  it('Can not require a non allowed library', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var NON_ALLOWED_LIBRARIES = ['fs', 'fs-extra', 'mongoose'];

    var requiredLibraries = NON_ALLOWED_LIBRARIES.map(function(lib) {
      return requirerMethod(lib);
    });

    requiredLibraries.forEach(function(lib) {
      expect(lib).to.not.exist;
    });

  });

  it('corbel-js should have the getDriver method', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var corbel = requirerMethod('corbel-js');
    expect(corbel).to.respondTo('getDriver');
  });

  it('corbel-js should have the generateDriver method', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var corbel = requirerMethod('corbel-js');
    expect(corbel).to.respondTo('generateDriver');
  });

  it('requires lodash correctly', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var _lodash = requirerMethod('lodash');
    expect(_lodash.map).to.be.a('function');
    expect(_lodash.chunk).to.be.a('function');
    expect(_lodash.flatten).to.be.a('function');
  });

  it('Can require its own snippets', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');
    var requirerMethodOtherDomain = composr.requirer.forDomain('otherDomain');

    var TheSnippet1 = requirerMethod('snippet-TheSnippet1');

    expect(TheSnippet1).to.exist;
    expect(TheSnippet1).to.be.a('function');


    var TheSnippet6 = requirerMethodOtherDomain('snippet-TheSnippet6');

    expect(TheSnippet6).to.exist;
    expect(TheSnippet6).to.be.a('number');
  });

  it('Returns the expected value', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var TheSnippet3 = requirerMethod('snippet-TheSnippet3');

    expect(TheSnippet3).to.exist;
    expect(TheSnippet3).to.be.a('string');
    expect(TheSnippet3).to.be.equals('My test');
  });

  it('Can not request other domain snippets', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var TheSnippet6 = requirerMethod('snippet-TheSnippet6');

    expect(TheSnippet6).to.be.a('null');
  });

  it('Returns null for empty parameter', function() {
    var requirerMethod = composr.requirer.forDomain('testDomain');

    var snippet = requirerMethod();

    expect(snippet).to.be.a('null');
  });

});