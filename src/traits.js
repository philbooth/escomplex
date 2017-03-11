/* globals require, exports */
'use strict'
var operatorTraits = require('./operators')
var operandTraits = require('./operands')
exports.actualise = actualise

function actualise (lloc, cyclomatic, operators, operands, children, assignableName, newScope, dependencies) {
  return {
    assignableName: assignableName,
    children: safeArray(children),
    cyclomatic: cyclomatic,
    dependencies: dependencies,
    lloc: lloc,
    newScope: newScope,
    operands: operandTraits.actualise(safeArray(operands)),
    operators: operatorTraits.actualise(safeArray(operators))
  }
}

function safeArray (thing) {
  if (typeof thing === 'undefined') {
    return []
  }
  if (Array.isArray(thing)) {
    return thing
  }
  return [
    thing
  ]
}
