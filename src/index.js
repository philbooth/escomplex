'use strict'

const _assign = require('lodash.assign')
const _negate = require('lodash.negate')
const _isNil = require('lodash.isnil')
const espree = require('espree')
const walker = require('./walker')
const core = require('./core')
const defaultParserOptions = require('./config').parserOptions

module.exports.analyse = (source, options, parsing) => {
  if (Array.isArray(source)) {
    return analyseProject(source, options, parsing)
  }
  return analyseModule(source, options, parsing)
}

module.exports.analyseModule = analyseModule
module.exports.analyseProject = analyseProject

function analyseProject (source, options, parsing) {
  const parser = getParser(parsing)
  const parserOptions = getParserOptions(parsing)
  const ast = parseProject(source, parser, parserOptions, options)
  return core.analyse(ast, walker, options)
}

function analyseModule (source, options, parsing) {
  const parser = getParser(parsing)
  const parserOptions = getParserOptions(parsing)
  const ast = parser(source, parserOptions)
  return core.analyse(ast, walker, options)
}

function getParserOptions (options) {
  const results = defaultParserOptions
  if (typeof options === 'object') {
    _assign(results, options)
  }

  // We must enable locations for the
  // Resulting AST, otherwise the metrics
  // Will be missing line information.
  results.loc = true
  return results
}

function getParser (customParser) {
  if (typeof customParser === 'function') {
    return customParser
  }
  return defaultParser
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
