'use strict'

var madge = require('madge')

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt)
  // load all grunt tasks
  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),

    mochaTest: { // test for nodejs app with mocha
      ci: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/**.test.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      all: 'dist'
    },

    standard: {
      lint: {
        src: [
          './{scripts,src}/**/*.js',
          // './test/**/**.test.js',
          '*.js'
        ]
      },
      format: {
        options: {
          format: true,
          lint: true
        },
        src: [
          './{scripts,src}/**/*.js',
          // './test/**/**.test.js',
          '*.js'
        ]
      }
    }

  })

  // Register circular dependencies
  grunt.registerTask('madge', 'Run madge.', function () {
    var dependencyObject = madge('./src')
    var listOfCircularDependencies = dependencyObject.circular().getArray()

    if (listOfCircularDependencies.length > 0) {
      grunt.log.error('CIRCULAR DEPENDENCIES FOUND')
      grunt.log.error(listOfCircularDependencies)
      return false
    } else {
      grunt.log.writeln('No circular dependencies found :)')
    }
  })

  grunt.registerTask('test', [
    'standard:format',
    'madge',
    'mochaTest:ci'
  ])
}
