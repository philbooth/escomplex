/* globals require, exports */
'use strict'
var traits = require('../traits')
var safeName = require('../safeName')
exports.get = get

function get () {
  return traits.actualise(1, 0, {
    filter: function (node) {
      return !!node.init
    },
    identifier: '='
  }, undefined, [
    'id',
    'init'
  ], function (node) {
    return safeName(node.id)
  })
}
