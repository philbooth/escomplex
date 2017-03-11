/* globals require, suite, test, setup, teardown */
'use strict'
var assert = require('chai').assert
var mozWalker = require('../src/walker')
var parsers = require('./helpers/parsers')
var modulePath = '../src/project'
suite('project:', function () {
  test('require does not throw', function () {
    assert.doesNotThrow(function () {
      require(modulePath)
    })
  })
  test('require returns object', function () {
    assert.isObject(require(modulePath))
  })
  suite('require:', function () {
    var cr
    setup(function () {
      cr = require(modulePath)
    })
    teardown(function () {
      cr = undefined
    })
    test('analyse function is exported', function () {
      assert.isFunction(cr.analyse)
    })
    test('processResults function is exported', function () {
      assert.isFunction(cr.processResults)
    })
    test('analyse throws when modules is object', function () {
      assert.throws(function () {
        cr.analyse({
          body: [],
          loc: {
            end: {
              line: 0
            },
            start: {
              line: 0
            }
          }
        }, mozWalker)
      })
    })
    test('analyse does not throw when modules is array', function () {
      assert.doesNotThrow(function () {
        cr.analyse([], mozWalker)
      })
    })
    suite('no modules:', function () {
      var result
      setup(function () {
        result = cr.analyse([], mozWalker)
      })
      teardown(function () {
        result = undefined
      })
      test('object was returned', function () {
        assert.isObject(result)
      })
      test('reports array exists', function () {
        assert.isArray(result.reports)
      })
      test('reports array has zero length', function () {
        assert.lengthOf(result.reports, 0)
      })
      test('adjacency matrix exists', function () {
        assert.isArray(result.adjacencyMatrix)
      })
      test('adjacency matrix has zero length', function () {
        assert.lengthOf(result.adjacencyMatrix, 0)
      })
      test('first-order density is correct', function () {
        assert.strictEqual(result.firstOrderDensity, 0)
      })
      test('change cost is correct', function () {
        assert.strictEqual(result.changeCost, 0)
      })
      test('core size is correct', function () {
        assert.strictEqual(result.coreSize, 0)
      })
      test('mean per-function logical LOC is correct', function () {
        assert.strictEqual(result.loc, 0)
      })
      test('mean per-function cyclomatic complexity is correct', function () {
        assert.strictEqual(result.cyclomatic, 0)
      })
      test('mean per-function Halstead effort is correct', function () {
        assert.strictEqual(result.effort, 0)
      })
      test('mean per-function parameter count is correct', function () {
        assert.strictEqual(result.params, 0)
      })
      test('mean per-function maintainability index is correct', function () {
        assert.strictEqual(result.maintainability, 0)
      })
    })
    parsers.forEach(function (parserName, parser, options) {
      suite('two modules:', function () {
        var result
        setup(function () {
          result = cr.analyse([
            {
              ast: parser.parse('function foo (a, b) { if (a) { b(a); } else { a(b); } } function bar (c, d) { var i; for (i = 0; i < c.length; i += 1) { d += 1; } console.log(d); }', options),
              path: 'b'
            },
            {
              ast: parser.parse('if (true) { "foo"; } else { "bar"; }', options),
              path: 'a'
            }
          ], mozWalker)
        })
        teardown(function () {
          result = undefined
        })
        test('reports is correct length', function () {
          assert.lengthOf(result.reports, 2)
        })
        test('first report aggregate has correct physical lines of code', function () {
          assert.strictEqual(result.reports[0].aggregate.sloc.physical, 1)
        })
        test('first report aggregate has correct logical lines of code', function () {
          assert.strictEqual(result.reports[0].aggregate.sloc.logical, 4)
        })
        test('first report aggregate has correct cyclomatic complexity', function () {
          assert.strictEqual(result.reports[0].aggregate.cyclomatic, 2)
        })
        test('first report aggregate has correct cyclomatic complexity density', function () {
          assert.strictEqual(result.reports[0].aggregate.cyclomaticDensity, 50)
        })
        test('first report functions is empty', function () {
          assert.lengthOf(result.reports[0].functions, 0)
        })
        test('first report aggregate has correct Halstead total operators', function () {
          assert.strictEqual(result.reports[0].aggregate.halstead.operators.total, 2)
        })
        test('first report aggregate has correct Halstead distinct operators', function () {
          assert.strictEqual(result.reports[0].aggregate.halstead.operators.distinct, 2)
        })
        test('first report aggregate has correct Halstead total operands', function () {
          assert.strictEqual(result.reports[0].aggregate.halstead.operands.total, 3)
        })
        test('first report aggregate has correct Halstead distinct operands', function () {
          assert.strictEqual(result.reports[0].aggregate.halstead.operands.distinct, 3)
        })
        test('first report aggregate has correct Halstead operator identifier length', function () {
          assert.lengthOf(result.reports[0].aggregate.halstead.operators.identifiers, result.reports[0].aggregate.halstead.operators.distinct)
        })
        test('first report aggregate has correct Halstead operand identifier length', function () {
          assert.lengthOf(result.reports[0].aggregate.halstead.operands.identifiers, result.reports[0].aggregate.halstead.operands.distinct)
        })
        test('first report aggregate has correct Halstead length', function () {
          assert.strictEqual(result.reports[0].aggregate.halstead.length, 5)
        })
        test('first report aggregate has correct Halstead vocabulary', function () {
          assert.strictEqual(result.reports[0].aggregate.halstead.vocabulary, 5)
        })
        test('first report aggregate has correct Halstead difficulty', function () {
          assert.strictEqual(result.reports[0].aggregate.halstead.difficulty, 1)
        })
        test('first report aggregate has correct Halstead volume', function () {
          assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.volume), 12)
        })
        test('first report aggregate has correct Halstead effort', function () {
          assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.effort), 12)
        })
        test('first report aggregate has correct Halstead bugs', function () {
          assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.bugs), 0)
        })
        test('first report aggregate has correct Halstead time', function () {
          assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.time), 1)
        })
        test('first report has correct path', function () {
          assert.strictEqual(result.reports[0].path, 'a')
        })
        test('second report maintainability index is correct', function () {
          assert.strictEqual(Math.round(result.reports[1].maintainability), 128)
        })
        test('second report first function has correct parameter count', function () {
          assert.strictEqual(result.reports[1].functions[0].params, 2)
        })
        test('second report second function has correct parameter count', function () {
          assert.strictEqual(result.reports[1].functions[1].params, 2)
        })
        test('second report aggregate has correct parameter count', function () {
          assert.strictEqual(result.reports[1].aggregate.params, 4)
        })
        test('second report mean parameter count is correct', function () {
          assert.strictEqual(result.reports[1].params, 2)
        })
        test('second report has correct path', function () {
          assert.strictEqual(result.reports[1].path, 'b')
        })
        test('first-order density is correct', function () {
          assert.strictEqual(result.firstOrderDensity, 0)
        })
        test('change cost is correct', function () {
          assert.strictEqual(result.changeCost, 50)
        })
        test('core size is correct', function () {
          assert.strictEqual(result.coreSize, 0)
        })
        test('mean per-function logical LOC is correct', function () {
          assert.strictEqual(result.loc, 4)
        })
        test('mean per-function cyclomatic complexity is correct', function () {
          assert.strictEqual(result.cyclomatic, 2)
        })
        test('mean per-function Halstead effort is correct', function () {
          assert.strictEqual(result.effort, 193.1614743092401)
        })
        test('mean per-function parameter count is correct', function () {
          assert.strictEqual(result.params, 1)
        })
        test('mean per-function maintainability index is correct', function () {
          assert.strictEqual(result.maintainability, 134.05623254229997)
        })
      })
      suite('two modules with different options:', function () {
        var modules = []
        var reportsOnly
        setup(function () {
          modules.push({
            ast: parser.parse('function foo (a, b) { if (a) { b(a); } else { a(b); } } function bar (c, d) { var i; for (i = 0; i < c.length; i += 1) { d += 1; } console.log(d); }', options),
            path: 'b'
          })
          modules.push({
            ast: parser.parse('if (true) { "foo"; } else { "bar"; }', options),
            path: 'a'
          })
          reportsOnly = cr.analyse(modules, mozWalker, {
            skipCalculation: true
          })
        })
        test('should not have aggregates if we call with skipCalculation', function () {
          assert.deepEqual(Object.keys(reportsOnly), [
            'reports'
          ])
        })
        test('should not have coreSize or visibilityMatrix if we call with noCoreSize', function () {
          var results = cr.analyse(modules, mozWalker, {
            noCoreSize: true
          })
          assert.notOk(results.coreSize)
          assert.notOk(results.visibilityMatrix)

          // Make sure we still have a few things though
          assert.ok(results.adjacencyMatrix)
          assert.ok(results.loc)
        })
        test('should be able to run processResults', function () {
          var fullReport
          var calcReport
          fullReport = cr.analyse(modules, mozWalker)
          calcReport = cr.processResults(reportsOnly)
          assert.deepEqual(calcReport, fullReport)
        })
        test('should be able to run processResults without calculating coreSize', function () {
          var results = cr.processResults(reportsOnly, true)
          assert.notOk(results.coreSize)
          assert.notOk(results.visibilityMatrix)

          // Make sure we still have a few things though
          assert.ok(results.adjacencyMatrix)
          assert.ok(results.loc)
        })
      })
      suite('require directory (index.js)', function () {
        setup(function () {
          this.path1 = '/b.js'
          this.path2 = '/mod/index.js'
          this.path3 = '/mod/a.js'
          var result = cr.analyse([
            {
              ast: parser.parse('require("./mod")', options),
              path: this.path1
            },
            {
              ast: parser.parse('require("./a")', options),
              path: this.path2
            },
            {
              ast: parser.parse('require("../b.js")', options),
              path: this.path3
            }
          ], mozWalker)
          this.processResults = cr.processResults(result)
        })
        test('adjacency matrix is correct', function () {
          assert.strictEqual(this.processResults.reports[0].path, this.path1)
          assert.strictEqual(this.processResults.reports[1].path, this.path3)
          assert.strictEqual(this.processResults.reports[2].path, this.path2)
          assert.strictEqual(this.processResults.adjacencyMatrix.length, 3)
          assert.strictEqual(this.processResults.adjacencyMatrix[0][0], 0)
          assert.strictEqual(this.processResults.adjacencyMatrix[0][1], 0)
          assert.strictEqual(this.processResults.adjacencyMatrix[0][2], 1)
          assert.strictEqual(this.processResults.adjacencyMatrix[1][0], 1)
          assert.strictEqual(this.processResults.adjacencyMatrix[1][1], 0)
          assert.strictEqual(this.processResults.adjacencyMatrix[1][2], 0)
          assert.strictEqual(this.processResults.adjacencyMatrix[2][0], 0)
          assert.strictEqual(this.processResults.adjacencyMatrix[2][1], 1)
          assert.strictEqual(this.processResults.adjacencyMatrix[2][2], 0)
        })
        test('visibility matrix is correct', function () {
          assert.strictEqual(this.processResults.reports[0].path, this.path1)
          assert.strictEqual(this.processResults.reports[1].path, this.path3)
          assert.strictEqual(this.processResults.reports[2].path, this.path2)
          assert.strictEqual(this.processResults.visibilityMatrix.length, 3)
          assert.strictEqual(this.processResults.visibilityMatrix[0][0], 0)
          assert.strictEqual(this.processResults.visibilityMatrix[0][1], 1)
          assert.strictEqual(this.processResults.visibilityMatrix[0][2], 1)
          assert.strictEqual(this.processResults.visibilityMatrix[1][0], 1)
          assert.strictEqual(this.processResults.visibilityMatrix[1][1], 0)
          assert.strictEqual(this.processResults.visibilityMatrix[1][2], 1)
          assert.strictEqual(this.processResults.visibilityMatrix[2][0], 1)
          assert.strictEqual(this.processResults.visibilityMatrix[2][1], 1)
          assert.strictEqual(this.processResults.visibilityMatrix[2][2], 0)
        })
      })
      suite('modules with dependencies:', function () {
        var result
        setup(function () {
          result = cr.analyse([
            {
              ast: parser.parse('require("./a");"d";', options),
              path: '/d.js'
            },
            {
              ast: parser.parse('require("./b");"c";', options),
              path: '/a/c.js'
            },
            {
              ast: parser.parse('require("./c");"b";', options),
              path: '/a/b.js'
            },
            {
              ast: parser.parse('require("./a/b");require("./a/c");"a";', options),
              path: '/a.js'
            }
          ], mozWalker)
        })
        teardown(function () {
          result = undefined
        })
        test('reports are in correct order', function () {
          assert.strictEqual(result.reports[0].path, '/a.js')
          assert.strictEqual(result.reports[1].path, '/d.js')
          assert.strictEqual(result.reports[2].path, '/a/b.js')
          assert.strictEqual(result.reports[3].path, '/a/c.js')
        })
        test('adjacency matrix is correct', function () {
          assert.lengthOf(result.adjacencyMatrix, 4)
          assert.lengthOf(result.adjacencyMatrix[0], 4)
          assert.strictEqual(result.adjacencyMatrix[0][0], 0)
          assert.strictEqual(result.adjacencyMatrix[0][1], 0)
          assert.strictEqual(result.adjacencyMatrix[0][2], 1)
          assert.strictEqual(result.adjacencyMatrix[0][3], 1)
          assert.lengthOf(result.adjacencyMatrix[1], 4)
          assert.strictEqual(result.adjacencyMatrix[1][0], 1)
          assert.strictEqual(result.adjacencyMatrix[1][1], 0)
          assert.strictEqual(result.adjacencyMatrix[1][2], 0)
          assert.strictEqual(result.adjacencyMatrix[1][3], 0)
          assert.lengthOf(result.adjacencyMatrix[2], 4)
          assert.strictEqual(result.adjacencyMatrix[2][0], 0)
          assert.strictEqual(result.adjacencyMatrix[2][1], 0)
          assert.strictEqual(result.adjacencyMatrix[2][2], 0)
          assert.strictEqual(result.adjacencyMatrix[2][3], 1)
          assert.lengthOf(result.adjacencyMatrix[3], 4)
          assert.strictEqual(result.adjacencyMatrix[3][0], 0)
          assert.strictEqual(result.adjacencyMatrix[3][1], 0)
          assert.strictEqual(result.adjacencyMatrix[3][2], 1)
          assert.strictEqual(result.adjacencyMatrix[3][3], 0)
        })
        test('first order density is correct', function () {
          assert.strictEqual(result.firstOrderDensity, 31.25)
        })
        test('change cost is correct', function () {
          assert.strictEqual(result.changeCost, 68.75)
        })
        test('core size is correct', function () {
          assert.strictEqual(result.coreSize, 0)
        })
      })
      suite('MacCormack, Rusnak & Baldwin example:', function () {
        var result
        setup(function () {
          result = cr.analyse([
            {
              ast: parser.parse('"f";', options),
              path: '/a/c/f.js'
            },
            {
              ast: parser.parse('require("./f");"e";', options),
              path: '/a/c/e.js'
            },
            {
              ast: parser.parse('"d";', options),
              path: '/a/b/d.js'
            },
            {
              ast: parser.parse('require("./c/e");"c";', options),
              path: '/a/c.js'
            },
            {
              ast: parser.parse('require("./b/d");"b";', options),
              path: '/a/b.js'
            },
            {
              ast: parser.parse('require("./a/b");require("./a/c");"a";', options),
              path: '/a.js'
            }
          ], mozWalker)
        })
        teardown(function () {
          result = undefined
        })
        test('reports are in correct order', function () {
          assert.strictEqual(result.reports[0].path, '/a.js')
          assert.strictEqual(result.reports[1].path, '/a/b.js')
          assert.strictEqual(result.reports[2].path, '/a/c.js')
          assert.strictEqual(result.reports[3].path, '/a/b/d.js')
          assert.strictEqual(result.reports[4].path, '/a/c/e.js')
          assert.strictEqual(result.reports[5].path, '/a/c/f.js')
        })
        test('adjacency matrix is correct', function () {
          assert.lengthOf(result.adjacencyMatrix, 6)
          assert.lengthOf(result.adjacencyMatrix[0], 6)
          assert.strictEqual(result.adjacencyMatrix[0][0], 0)
          assert.strictEqual(result.adjacencyMatrix[0][1], 1)
          assert.strictEqual(result.adjacencyMatrix[0][2], 1)
          assert.strictEqual(result.adjacencyMatrix[0][3], 0)
          assert.strictEqual(result.adjacencyMatrix[0][4], 0)
          assert.strictEqual(result.adjacencyMatrix[0][5], 0)
          assert.lengthOf(result.adjacencyMatrix[1], 6)
          assert.strictEqual(result.adjacencyMatrix[1][0], 0)
          assert.strictEqual(result.adjacencyMatrix[1][1], 0)
          assert.strictEqual(result.adjacencyMatrix[1][2], 0)
          assert.strictEqual(result.adjacencyMatrix[1][3], 1)
          assert.strictEqual(result.adjacencyMatrix[1][4], 0)
          assert.strictEqual(result.adjacencyMatrix[1][5], 0)
          assert.lengthOf(result.adjacencyMatrix[2], 6)
          assert.strictEqual(result.adjacencyMatrix[2][0], 0)
          assert.strictEqual(result.adjacencyMatrix[2][1], 0)
          assert.strictEqual(result.adjacencyMatrix[2][2], 0)
          assert.strictEqual(result.adjacencyMatrix[2][3], 0)
          assert.strictEqual(result.adjacencyMatrix[2][4], 1)
          assert.strictEqual(result.adjacencyMatrix[2][5], 0)
          assert.lengthOf(result.adjacencyMatrix[3], 6)
          assert.strictEqual(result.adjacencyMatrix[3][0], 0)
          assert.strictEqual(result.adjacencyMatrix[3][1], 0)
          assert.strictEqual(result.adjacencyMatrix[3][2], 0)
          assert.strictEqual(result.adjacencyMatrix[3][3], 0)
          assert.strictEqual(result.adjacencyMatrix[3][4], 0)
          assert.strictEqual(result.adjacencyMatrix[3][5], 0)
          assert.lengthOf(result.adjacencyMatrix[4], 6)
          assert.strictEqual(result.adjacencyMatrix[4][0], 0)
          assert.strictEqual(result.adjacencyMatrix[4][1], 0)
          assert.strictEqual(result.adjacencyMatrix[4][2], 0)
          assert.strictEqual(result.adjacencyMatrix[4][3], 0)
          assert.strictEqual(result.adjacencyMatrix[4][4], 0)
          assert.strictEqual(result.adjacencyMatrix[4][5], 1)
          assert.lengthOf(result.adjacencyMatrix[5], 6)
          assert.strictEqual(result.adjacencyMatrix[5][0], 0)
          assert.strictEqual(result.adjacencyMatrix[5][1], 0)
          assert.strictEqual(result.adjacencyMatrix[5][2], 0)
          assert.strictEqual(result.adjacencyMatrix[5][3], 0)
          assert.strictEqual(result.adjacencyMatrix[5][4], 0)
          assert.strictEqual(result.adjacencyMatrix[5][5], 0)
        })
        test('first order density is correct', function () {
          assert.isTrue(result.firstOrderDensity > 13.88)
          assert.isTrue(result.firstOrderDensity < 13.89)
        })
        test('change cost is correct', function () {
          assert.isTrue(result.changeCost > 41.66)
          assert.isTrue(result.changeCost < 41.67)
        })
        test('core size is correct', function () {
          assert.isTrue(result.coreSize > 16.66)
          assert.isTrue(result.coreSize < 16.67)
        })
      })
    })
  })
})
