'use strict';

function MockedNext(data) {
  return Promise.resolve(data);
}

module.exports = MockedNext;