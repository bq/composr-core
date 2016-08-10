'use strict'

// custom error
var ComposrError = function ComposrError (error, description, status) {
  var err = new Error(error)
  Object.setPrototypeOf(err, ComposrError.prototype)

  // set properties specific to the custom error
  err.status = parseInt(status, 10)
  err.error = error
  err.errorDescription = description

  return err
}

ComposrError.prototype = Object.create(Error.prototype, {
  name: {
    value: 'ComposrError',
    enumerable: false
  }
})

module.exports = ComposrError
