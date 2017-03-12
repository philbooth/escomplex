/* globals require, exports */
'use strict'
var traits = require('../traits')
exports.get = get

function get () {
  return traits.actualise(function (node) {
    return node.alternate ? 2 : 1
  }, 1, [
    'if',
    {
      filter: function (node) {
        return !!node.alternate
      },
      identifier: 'else'
    }
  ], undefined, [
    'test',
    'consequent',
    'alternate'
  ])
}
