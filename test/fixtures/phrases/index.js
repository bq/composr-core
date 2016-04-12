'use strict'

var correctPhrases = require('./correct')
var malformedPhrases = require('./malformed')
var maliciousPhrases = require('./malicious')

module.exports = {
  correct: correctPhrases,
  malformed: malformedPhrases,
  malicious: maliciousPhrases
}
