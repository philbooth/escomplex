'use strict'

const _assign = require('lodash.assign')
const _negate = require('lodash.negate')
const _isNil = require('lodash.isnil')
const espree = require('espree')
const walker = require('./walker')
const core = require('./core')
const debug = require('debug')('escomplex')
const defaultParserOptions = require('./config').parserOptions

module.exports.analyse = (source, options, parsing) => {
  var ast
  var parser = defaultParser
  const parserOptions = defaultParserOptions

  if (typeof parsing === 'function') {
    parser = parsing
    debug('Custom parse function')
  }
  if (typeof parsing === 'object') {
    _assign(parserOptions, parsing)
    debug('Custom parser options')
  }

  // We must enable locations for the
  // Resulting AST, otherwise the metrics
  // Will be missing line information.
  parserOptions.loc = true
  if (Array.isArray(source)) {
    ast = parseProject(source, parser, parserOptions, options)
  } else {
    ast = parser(source, parserOptions)
  }
  return core.analyse(ast, walker, options)
}

function defaultParser (source, parserOptions) {
  return espree.parse(source, parserOptions)
}

function parseProject (sources, parser, parserOptions, options) {
  return sources.map(source => {
    try {
      return {
        ast: parser(source.code, parserOptions),
        path: source.path
      }
    } catch (error) {
      if (options.ignoreErrors) {
        return null
      }
      error.message = source.path + ': ' + error.message
      throw error
    }
  })
  .filter(_negate(_isNil))
}
