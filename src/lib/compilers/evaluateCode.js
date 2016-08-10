'use strict'

var vm = require('vm')
var uglifyJs = require('uglify-js')

function __codeOptimization (code) {
  var optimized = uglifyJs.minify(code, {
    fromString: true,
    mangle: {
      sort: true
    },
    compress: {
      sequences: true,
      properties: true,
      dead_code: true,
      drop_debugger: true,
      conditionals: true,
      evaluate: true,
      booleans: true,
      loops: true,
      unused: true,
      if_return: true,
      join_vars: true,
      cascade: true,
      drop_console: false
    }
  })
  return optimized.code
}

function evaluateCode (functionBody, params, debugFilePath) {
  var functionParams = params || []

  var result = {
    fn: null,
    script: null,
    error: false,
    code: functionBody
  }

  /**
   * Optimization code to run in VM
   */

  try {
    var optimized = __codeOptimization(functionBody)

    // TODO: We want a named function here http://stackoverflow.com/questions/9479046/is-there-any-non-eval-way-to-create-a-function-with-a-runtime-determined-name
    result.fn = Function.apply(null, functionParams.concat(optimized))

    var options = {
      displayErrors: true
    }

    if (debugFilePath) {
      options.filename = debugFilePath
    }

    result.script = new vm.Script(optimized, options)
  } catch (e) {
    result.error = e
  }

  return result
}

module.exports = evaluateCode
