'use strict'
var assert = require('chai').assert
var escomplex = require('../src')
var parsers = require('./helpers/parsers')
suite('index parser overrides', function () {
  parsers.forEach(function (parserName, parser, options) {
    test('AST callback for module does not alter behavior', function () {
      var wasCalled = false
      var expected = escomplex.analyse('var a;', {})
      var actual = escomplex.analyse('var a;', {}, function (source) {
        wasCalled = true
        return parser.parse(source, options)
      })
      assert.ok(wasCalled)
      assert.deepEqual(expected, actual)
    })
    test('overriding parser fn does not alter behavior for project', function () {
      var sources = [
        {
          path: 'one',
          code: 'var a;'
        },
        {
          path: 'two',
          code: 'var b;'
        }
      ]
      var callCount = 0
      var expected = escomplex.analyse(sources, {})
      var actual = escomplex.analyse(sources, {}, function (source) {
        assert.ok(source)
        callCount++
        return parser.parse(source, options)
      })
      assert.equal(callCount, sources.length)
      assert.deepEqual(expected, actual)
    })
    test('overriding parser options does not alter behavior', function () {
      var sources = [
        {
          path: 'one',
          code: 'var a;'
        },
        {
          path: 'two',
          code: 'var b;'
        }
      ]
      var expected = escomplex.analyse(sources, {})
      var actual = escomplex.analyse(sources, {}, {
        loc: false,
        range: true
      })
      assert.deepEqual(expected, actual)
    })
  })
})
