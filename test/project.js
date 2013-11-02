/*globals require, suite, test, setup, teardown */

'use strict';

var assert, mozWalker, esprima, modulePath,

assert = require('chai').assert;
mozWalker = require('escomplex-ast-moz');
esprima = require('esprima');

modulePath = '../src/project';

suite('project:', function () {
    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var cr;

        setup(function () {
            cr = require(modulePath);
        });

        teardown(function () {
            cr = undefined;
        });

        test('analyse function is exported', function () {
            assert.isFunction(cr.analyse);
        });

        test('analyse throws when modules is object', function () {
            assert.throws(function () {
                cr.analyse({
                    body: [],
                    loc: {
                        start: {
                            line: 0
                        },
                        end: {
                            line: 0
                        }
                    }
                }, mozWalker);
            });
        });

        test('analyse does not throw when modules is array', function () {
            assert.doesNotThrow(function () {
                cr.analyse([], mozWalker);
            });
        });

        suite('no modules:', function () {
            var result;

            setup(function () {
                result = cr.analyse([], mozWalker);
            });

            teardown(function () {
                result = undefined;
            });

            test('object was returned', function () {
                assert.isObject(result);
            });

            test('reports array exists', function () {
                assert.isArray(result.reports);
            });

            test('reports array has zero length', function () {
                assert.lengthOf(result.reports, 0);
            });

            test('matrices object exists', function () {
                assert.isObject(result.matrices);
            });

            test('adjacency matrix exists', function () {
                assert.isArray(result.matrices.adjacency.matrix);
            });

            test('adjacency matrix has zero length', function () {
                assert.lengthOf(result.matrices.adjacency.matrix, 0);
            });

            test('first-order density is correct', function () {
                assert.strictEqual(result.matrices.adjacency.density, 0);
            });

            test('change cost is correct', function () {
                assert.strictEqual(result.matrices.visibility.density, 0);
            });

            test('core size is correct', function () {
                assert.strictEqual(result.matrices.visibility.coreSize, 0);
            });
        });

        suite('two modules:', function () {
            var result;

            setup(function () {
                result = cr.analyse([
                    { ast: esprima.parse('function foo (a, b) { if (a) { b(a); } else { a(b); } } function bar (c, d) { var i; for (i = 0; i < c.length; i += 1) { d += 1; } console.log(d); }', { loc: true }), path: 'b' },
                    { ast: esprima.parse('if (true) { "foo"; } else { "bar"; }', { loc: true }), path: 'a' }
                ], mozWalker);
            });

            teardown(function () {
                result = undefined;
            });

            test('reports is correct length', function () {
                assert.lengthOf(result.reports, 2);
            });

            test('first report aggregate has correct physical lines of code', function () {
                assert.strictEqual(result.reports[0].aggregate.sloc.physical, 1);
            });

            test('first report aggregate has correct logical lines of code', function () {
                assert.strictEqual(result.reports[0].aggregate.sloc.logical, 4);
            });

            test('first report aggregate has correct cyclomatic complexity', function () {
                assert.strictEqual(result.reports[0].aggregate.cyclomatic, 2);
            });

            test('first report aggregate has correct cyclomatic complexity density', function () {
                assert.strictEqual(result.reports[0].aggregate.cyclomaticDensity, 50);
            });

            test('first report functions is empty', function () {
                assert.lengthOf(result.reports[0].functions, 0);
            });

            test('first report aggregate has correct Halstead total operators', function () {
                assert.strictEqual(result.reports[0].aggregate.halstead.operators.total, 2);
            });

            test('first report aggregate has correct Halstead distinct operators', function () {
                assert.strictEqual(result.reports[0].aggregate.halstead.operators.distinct, 2);
            });

            test('first report aggregate has correct Halstead total operands', function () {
                assert.strictEqual(result.reports[0].aggregate.halstead.operands.total, 3);
            });

            test('first report aggregate has correct Halstead distinct operands', function () {
                assert.strictEqual(result.reports[0].aggregate.halstead.operands.distinct, 3);
            });

            test('first report aggregate has correct Halstead operator identifier length', function () {
                assert.lengthOf(
                    result.reports[0].aggregate.halstead.operators.identifiers,
                    result.reports[0].aggregate.halstead.operators.distinct
                );
            });

            test('first report aggregate has correct Halstead operand identifier length', function () {
                assert.lengthOf(
                    result.reports[0].aggregate.halstead.operands.identifiers,
                    result.reports[0].aggregate.halstead.operands.distinct
                );
            });

            test('first report aggregate has correct Halstead length', function () {
                assert.strictEqual(result.reports[0].aggregate.halstead.length, 5);
            });

            test('first report aggregate has correct Halstead vocabulary', function () {
                assert.strictEqual(result.reports[0].aggregate.halstead.vocabulary, 5);
            });

            test('first report aggregate has correct Halstead difficulty', function () {
                assert.strictEqual(result.reports[0].aggregate.halstead.difficulty, 1);
            });

            test('first report aggregate has correct Halstead volume', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.volume), 12);
            });

            test('first report aggregate has correct Halstead effort', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.effort), 12);
            });

            test('first report aggregate has correct Halstead bugs', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.bugs), 0);
            });

            test('first report aggregate has correct Halstead time', function () {
                assert.strictEqual(Math.round(result.reports[0].aggregate.halstead.time), 1);
            });

            test('first report has correct path', function () {
                assert.strictEqual(result.reports[0].path, 'a');
            });

            test('second report maintainability index is correct', function () {
                assert.strictEqual(Math.round(result.reports[1].maintainability), 128);
            });

            test('second report first function has correct parameter count', function () {
                assert.strictEqual(result.reports[1].functions[0].params, 2);
            });

            test('second report second function has correct parameter count', function () {
                assert.strictEqual(result.reports[1].functions[1].params, 2);
            });

            test('second report aggregate has correct parameter count', function () {
                assert.strictEqual(result.reports[1].aggregate.params, 4);
            });

            test('second report mean parameter count is correct', function () {
                assert.strictEqual(result.reports[1].params, 2);
            });

            test('second report has correct path', function () {
                assert.strictEqual(result.reports[1].path, 'b');
            });

            test('first-order density is correct', function () {
                assert.strictEqual(result.matrices.adjacency.density, 0);
            });

            test('change cost is correct', function () {
                assert.strictEqual(result.matrices.visibility.density, 0.5);
            });

            test('core size is correct', function () {
                assert.strictEqual(result.matrices.visibility.coreSize, 0);
            });
        });

        suite('modules with dependencies:', function () {
            var result;

            setup(function () {
                result = cr.analyse([
                    { ast: esprima.parse('require("./a");"d";', { loc: true }), path: '/d.js' },
                    { ast: esprima.parse('require("./b");"c";', { loc: true }), path: '/a/c.js' },
                    { ast: esprima.parse('require("./c");"b";', { loc: true }), path: '/a/b.js' },
                    { ast: esprima.parse('require("./a/b");require("./a/c");"a";', { loc: true }), path: '/a.js' }
                ], mozWalker);
            });

            teardown(function () {
                result = undefined;
            });

            test('reports are in correct order', function () {
                assert.strictEqual(result.reports[0].path, '/a.js');
                assert.strictEqual(result.reports[1].path, '/d.js');
                assert.strictEqual(result.reports[2].path, '/a/b.js');
                assert.strictEqual(result.reports[3].path, '/a/c.js');
            });

            test('adjacency matrix is correct', function () {
                assert.lengthOf(result.matrices.adjacency.matrix, 4);

                assert.lengthOf(result.matrices.adjacency.matrix[0], 4);
                assert.strictEqual(result.matrices.adjacency.matrix[0][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[0][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[0][2], 1);
                assert.strictEqual(result.matrices.adjacency.matrix[0][3], 1);

                assert.lengthOf(result.matrices.adjacency.matrix[1], 4);
                assert.strictEqual(result.matrices.adjacency.matrix[1][0], 1);
                assert.strictEqual(result.matrices.adjacency.matrix[1][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[1][2], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[1][3], 0);

                assert.lengthOf(result.matrices.adjacency.matrix[2], 4);
                assert.strictEqual(result.matrices.adjacency.matrix[2][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[2][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[2][2], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[2][3], 1);

                assert.lengthOf(result.matrices.adjacency.matrix[3], 4);
                assert.strictEqual(result.matrices.adjacency.matrix[3][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[3][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[3][2], 1);
                assert.strictEqual(result.matrices.adjacency.matrix[3][3], 0);
            });

            test('first order density is correct', function () {
                assert.strictEqual(result.matrices.adjacency.density, 0.3125);
            });

            test('change cost is correct', function () {
                assert.strictEqual(result.matrices.visibility.density, 0.6875);
            });

            test('core size is correct', function () {
                assert.strictEqual(result.matrices.visibility.coreSize, 0);
            });
        });

        suite('MacCormack, Rusnak & Baldwin example:', function () {
            var result;

            setup(function () {
                result = cr.analyse([
                    { ast: esprima.parse('"f";', { loc: true }), path: '/a/c/f.js' },
                    { ast: esprima.parse('require("./f");"e";', { loc: true }), path: '/a/c/e.js' },
                    { ast: esprima.parse('"d";', { loc: true }), path: '/a/b/d.js' },
                    { ast: esprima.parse('require("./c/e");"c";', { loc: true }), path: '/a/c.js' },
                    { ast: esprima.parse('require("./b/d");"b";', { loc: true }), path: '/a/b.js' },
                    { ast: esprima.parse('require("./a/b");require("./a/c");"a";', { loc: true }), path: '/a.js' }
                ], mozWalker);
            });

            teardown(function () {
                result = undefined;
            });

            test('reports are in correct order', function () {
                assert.strictEqual(result.reports[0].path, '/a.js');
                assert.strictEqual(result.reports[1].path, '/a/b.js');
                assert.strictEqual(result.reports[2].path, '/a/c.js');
                assert.strictEqual(result.reports[3].path, '/a/b/d.js');
                assert.strictEqual(result.reports[4].path, '/a/c/e.js');
                assert.strictEqual(result.reports[5].path, '/a/c/f.js');
            });

            test('adjacency matrix is correct', function () {
                assert.lengthOf(result.matrices.adjacency.matrix, 6);

                assert.lengthOf(result.matrices.adjacency.matrix[0], 6);
                assert.strictEqual(result.matrices.adjacency.matrix[0][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[0][1], 1);
                assert.strictEqual(result.matrices.adjacency.matrix[0][2], 1);
                assert.strictEqual(result.matrices.adjacency.matrix[0][3], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[0][4], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[0][5], 0);

                assert.lengthOf(result.matrices.adjacency.matrix[1], 6);
                assert.strictEqual(result.matrices.adjacency.matrix[1][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[1][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[1][2], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[1][3], 1);
                assert.strictEqual(result.matrices.adjacency.matrix[1][4], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[1][5], 0);

                assert.lengthOf(result.matrices.adjacency.matrix[2], 6);
                assert.strictEqual(result.matrices.adjacency.matrix[2][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[2][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[2][2], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[2][3], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[2][4], 1);
                assert.strictEqual(result.matrices.adjacency.matrix[2][5], 0);

                assert.lengthOf(result.matrices.adjacency.matrix[3], 6);
                assert.strictEqual(result.matrices.adjacency.matrix[3][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[3][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[3][2], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[3][3], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[3][4], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[3][5], 0);

                assert.lengthOf(result.matrices.adjacency.matrix[4], 6);
                assert.strictEqual(result.matrices.adjacency.matrix[4][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[4][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[4][2], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[4][3], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[4][4], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[4][5], 1);

                assert.lengthOf(result.matrices.adjacency.matrix[5], 6);
                assert.strictEqual(result.matrices.adjacency.matrix[5][0], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[5][1], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[5][2], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[5][3], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[5][4], 0);
                assert.strictEqual(result.matrices.adjacency.matrix[5][5], 0);
            });

            test('first order density is correct', function () {
                assert.isTrue(result.matrices.adjacency.density > 0.138);
                assert.isTrue(result.matrices.adjacency.density < 0.139);
            });

            test('change cost is correct', function () {
                assert.isTrue(result.matrices.visibility.density > 0.4166);
                assert.isTrue(result.matrices.visibility.density < 0.4167);
            });

            test('core size is correct', function () {
                assert.isTrue(result.matrices.visibility.coreSize > 0.166);
                assert.isTrue(result.matrices.visibility.coreSize < 0.167);
            });
        });
    });
});

