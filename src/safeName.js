'use strict'

const _isObject = require('lodash.isobject')
const _isString = require('lodash.isstring')

module.exports = (object, defaultName) => {
  if (
    _isObject(object) &&
    _isString(object.name) &&
    object.name.length > 0
  ) {
    return object.name
  }

  if (
    _isString(defaultName) &&
    defaultName.length > 0
  ) {
    return defaultName
  }

  return '<anonymous>'
}
