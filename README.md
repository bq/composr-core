#CompoSR Core
----

[![NPM Version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Test Coverage][coverage-badge]][codeclimate-url]
[![Code Climate][codeclimate-badge]][codeclimate-url]

> The core package for Corbel's Composr. [NPM page][npm-url]



[npm-badge]: https://badge.fury.io/js/composr-core.svg
[npm-url]: https://www.npmjs.org/package/composr-core

[travis-badge]: https://travis-ci.org/bq/composr-core.svg
[travis-url]: https://travis-ci.org/bq/composr-core

[codeclimate-badge]: https://codeclimate.com/github/bq/composr-core/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/bq/composr-core

[coverage-badge]: https://codeclimate.com/github/bq/composr-core/badges/coverage.svg


TODO: add a regenerate driver method

var corbelDriver = corbel.getDriver(corbelConfig);

function regenerateDriver(){
    return corbelDriver.iam.token().create().then(function() {
        logger.debug('corbel:connection:success');
        return corbelDriver;
    }).catch(function(error) {
        logger.error('error:composer:corbel:token', error.response.body);
        pmx.notify('error:composer:corbel:token',  error.response.body);
        throw new ComposrError('error:composer:corbel:token', '', 401);
    });
}

var onConnectPromise = regenerateDriver();


//TODO add a loadAndRegisterPhrase / loadAndRegisterSnippet by id methods