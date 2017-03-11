'use strict'
var _isString = require('lodash.isstring')
var traits = require('../traits')

module.exports.get = function get () {
  return traits.actualise(0, 0, undefined, function (node) {
    if (_isString(node.value)) {
      // Avoid conflicts between string literals and identifiers.
      return '"' + node.value + '"'
    }
    return node.value
  })
}
