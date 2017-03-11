/* globals require, exports */
'use strict'
var traits = require('../traits')
exports.get = get

function get (settings) {
  return traits.actualise(0, function (node) {
    var isAnd = node.operator === '&&'
    var isOr = node.operator === '||'
    return (isAnd || (settings.logicalor && isOr)) ? 1 : 0
  }, function (node) {
    return node.operator
  }, undefined, [
    'left',
    'right'
  ])
}
