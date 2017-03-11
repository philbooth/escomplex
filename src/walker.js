'use strict'

var _isObject = require('lodash.isobject')
var _isFunction = require('lodash.isfunction')
var assert = require('assert')
var safeName = require('./safeName')
var syntaxDefinitions = require('./syntax')
var debug = require('debug')('escomplex:walker')

module.exports.walk = walk

// Settings
// - trycatch (Boolean)
// - forin (Boolean)
// - logicalor (Boolean)
// - switchcase (Boolean)
//

function walk (tree, settings, callbacks) {
  assert(_isObject(tree), 'Invalid syntax tree')
  assert(Array.isArray(tree.body), 'Invalid syntax tree body')
  assert(_isObject(settings), 'Invalid settings')
  assert(_isObject(callbacks), 'Invalid callbacks')
  assert(_isFunction(callbacks.processNode), 'Invalid processNode callback')
  assert(_isFunction(callbacks.createScope), 'Invalid createScope callback')
  assert(_isFunction(callbacks.popScope), 'Invalid popScope callback')

  var syntaxes = syntaxDefinitions.get(settings)
  visitNodes(tree.body)

  function visitNodes (nodes, assignedName) {
    nodes.forEach(function (node) {
      visitNode(node, assignedName)
    })
  }

  function visitNode (node, assignedName) {
    var syntax
    if (_isObject(node)) {
      debug('node type: ' + node.type)
      syntax = syntaxes[node.type]
      debug('syntax: ' + JSON.stringify(syntax))
      if (_isObject(syntax)) {
        callbacks.processNode(node, syntax)
        if (syntax.newScope) {
          callbacks.createScope(safeName(node.id, assignedName), node.loc, node.params.length)
        }
        visitChildren(node)
        if (syntax.newScope) {
          callbacks.popScope()
        }
      }
    }
  }

  function visitChildren (node) {
    var syntax = syntaxes[node.type]
    if (Array.isArray(syntax.children)) {
      syntax.children.forEach(function (child) {
        visitChild(node[child], _isFunction(syntax.assignableName) ? syntax.assignableName(node) : '')
      })
    }
  }

  function visitChild (child, assignedName) {
    var visitor = Array.isArray(child) ? visitNodes : visitNode
    visitor(child, assignedName)
  }
}
