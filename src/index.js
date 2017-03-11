/* globals require, exports */
'use strict'
var _assign = require('lodash.assign')
var _negate = require('lodash.negate')
var _isNil = require('lodash.isnil')
var espree = require('espree')
var walker = require('./walker')
var core = require('./core')
var debug = require('debug')('escomplex')
var defaultParserOptions = require('./config').parserOptions
module.exports.analyse = function analyse (source, options, parsing) {
  var ast
  var parser = defaultParser
  var parserOptions = defaultParserOptions
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
  debug('Parsed AST: ')
  debug(JSON.stringify(ast, null, 2))
  return core.analyse(ast, walker, options)
}

function defaultParser (source, parserOptions) {
  return espree.parse(source, parserOptions)
}

function parseProject (sources, parser, parserOptions, options) {
  return sources.map(function parseProjectModule (source) {
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
  }).filter(_negate(_isNil))
}
