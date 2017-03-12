'use strict'
var assert = require('chai').assert
var modulePath = '../src/operands'
suite('operands:', function () {
  test('require does not throw', function () {
    assert.doesNotThrow(function () {
      require(modulePath)
    })
  })
  test('require returns object', function () {
    assert.isObject(require(modulePath))
  })
  suite('require:', function () {
    var operands
    setup(function () {
      operands = require(modulePath)
    })
    teardown(function () {
      operands = undefined
    })
    test('actualise function is exported', function () {
      assert.isFunction(operands.actualise)
    })
    test('actualise throws when identifiers is object', function () {
      assert.throws(function () {
        operands.actualise({})
      })
    })
    test('actualise does not throw when identifiers is array', function () {
      assert.doesNotThrow(function () {
        operands.actualise([])
      })
    })
    suite('no identifiers:', function () {
      var result
      setup(function () {
        result = operands.actualise([])
      })
      teardown(function () {
        result = undefined
      })
      test('result was array', function () {
        assert.isArray(result)
      })
      test('result was empty', function () {
        assert.lengthOf(result, 0)
      })
    })
    suite('one identifier:', function () {
      var result
      setup(function () {
        result = operands.actualise([
          'foo'
        ])
      })
      teardown(function () {
        result = undefined
      })
      test('result contained one item', function () {
        assert.lengthOf(result, 1)
      })
      test('first item was correct', function () {
        assert.isObject(result[0])
        assert.strictEqual(result[0].identifier, 'foo')
      })
    })
    suite('two identifiers:', function () {
      var result
      setup(function () {
        result = operands.actualise([
          'bar',
          'baz'
        ])
      })
      teardown(function () {
        result = undefined
      })
      test('result contained two items', function () {
        assert.lengthOf(result, 2)
      })
      test('first item was correct', function () {
        assert.strictEqual(result[0].identifier, 'bar')
      })
      test('second item was correct', function () {
        assert.strictEqual(result[1].identifier, 'baz')
      })
    })
  })
})
