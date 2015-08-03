'use strict';

var correctPhrases = require('./correct');
var malformedPhrases = require('./malformed');

module.exports = {
  correct : correctPhrases,
  malformed : malformedPhrases
};