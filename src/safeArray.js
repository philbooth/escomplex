'use strict'

module.exports = thing => {
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
