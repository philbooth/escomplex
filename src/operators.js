'use strict'

module.exports.actualise = properties => properties.map(property => {
  if (property && typeof property.identifier !== 'undefined') {
    return property
  }
  return {
    identifier: property
  }
})
