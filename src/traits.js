'use strict'

const operatorTraits = require('./operators')
const operandTraits = require('./operands')
const safeArray = thing => {
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

module.exports.actualise = (
  lloc,
  cyclomatic,
  operators,
  operands,
  children,
  assignableName,
  newScope,
  dependencies
) => ({
  assignableName,
  children: safeArray(children),
  cyclomatic,
  dependencies,
  lloc,
  newScope,
  operands: operandTraits.actualise(safeArray(operands)),
  operators: operatorTraits.actualise(safeArray(operators))
})
