'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../src';

mockery.registerAllowable(modulePath);
mockery.registerAllowable('check-types');

suite('index:', function () {
    var log, walker;

    setup(function () {
        log = {};
        walker = {};
        mockery.enable({ useCleanCache: true });
        mockery.registerMock('esprima', {
            parse: spooks.fn({
                name: 'esprima.parse',
                log: log,
                result: 'esprima.parse result'
            })
        });
        mockery.registerMock('./walker', walker);
        mockery.registerMock('./core', {
            analyse: spooks.fn({
                name: 'core.analyse',
                log: log,
                result: 'core.analyse result'
            })
        });
    });

    teardown(function () {
        mockery.deregisterMock('esprima');
        mockery.deregisterMock('./walker');
        mockery.deregisterMock('./core');
        mockery.disable();
        log = walker = undefined;
    });

    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var index;

        setup(function () {
            index = require(modulePath);
        });

        teardown(function () {
            index = undefined;
        });

        test('analyse function is exported', function () {
            assert.isFunction(index.analyse);
        });

        test('analyse does not throw', function () {
            assert.doesNotThrow(function () {
                index.analyse();
            });
        });

        test('esprima.parse was not called', function () {
            assert.strictEqual(log.counts['esprima.parse'], 0);
        });

        test('core.analyse was not called', function () {
            assert.strictEqual(log.counts['core.analyse'], 0);
        });

        suite('array source:', function () {
            var options, result;

            setup(function () {
                options = {};
                result = index.analyse([ { path: '/foo.js', code: 'console.log("foo");' }, { path: '../bar.js', code: '"bar";' } ], options);
            });

            teardown(function () {
                options = result = undefined;
            });

            test('esprima.parse was called twice', function () {
                assert.strictEqual(log.counts['esprima.parse'], 2);
            });

            test('esprima.parse was passed two arguments first time', function () {
                assert.lengthOf(log.args['esprima.parse'][0], 2);
            });

            test('esprima.parse was given correct source first time', function () {
                assert.strictEqual(log.args['esprima.parse'][0][0], 'console.log("foo");');
            });

            test('esprima.parse was given correct options first time', function () {
                assert.isObject(log.args['esprima.parse'][0][1]);
                assert.isTrue(log.args['esprima.parse'][0][1].loc);
                assert.lengthOf(Object.keys(log.args['esprima.parse'][0][1]), 1);
            });

            test('esprima.parse was passed two arguments second time', function () {
                assert.lengthOf(log.args['esprima.parse'][1], 2);
            });

            test('esprima.parse was given correct source second time', function () {
                assert.strictEqual(log.args['esprima.parse'][1][0], '"bar";');
            });

            test('esprima.parse was given correct options second time', function () {
                assert.isObject(log.args['esprima.parse'][1][1]);
                assert.isTrue(log.args['esprima.parse'][1][1].loc);
                assert.lengthOf(Object.keys(log.args['esprima.parse'][1][1]), 1);
            });

            test('core.analyse was called once', function () {
                assert.strictEqual(log.counts['core.analyse'], 1);
            });

            test('core.analyse was passed three arguments', function () {
                assert.lengthOf(log.args['core.analyse'][0], 3);
            });

            test('core.analyse was given correct asts', function () {
                assert.isArray(log.args['core.analyse'][0][0]);
                assert.lengthOf(log.args['core.analyse'][0][0], 2);

                assert.isObject(log.args['core.analyse'][0][0][0]);
                assert.strictEqual(log.args['core.analyse'][0][0][0].path, '/foo.js');
                assert.strictEqual(log.args['core.analyse'][0][0][0].ast, 'esprima.parse result');
                assert.lengthOf(Object.keys(log.args['core.analyse'][0][0][0]), 2);

                assert.isObject(log.args['core.analyse'][0][0][1]);
                assert.strictEqual(log.args['core.analyse'][0][0][1].path, '../bar.js');
                assert.strictEqual(log.args['core.analyse'][0][0][1].ast, 'esprima.parse result');
                assert.lengthOf(Object.keys(log.args['core.analyse'][0][0][1]), 2);
            });

            test('core.analyse was given correct walker', function () {
                assert.strictEqual(log.args['core.analyse'][0][1], walker);
            });

            test('core.analyse was given correct options', function () {
                assert.strictEqual(log.args['core.analyse'][0][2], options);
            });

            test('correct result was returned', function () {
                assert.strictEqual(result, 'core.analyse result');
            });
        });

        suite('array source with bad code:', function() {
            var code;

            setup(function () {
                mockery.deregisterMock('esprima');
                mockery.disable();
                code = [ { path: '/foo.js', code: 'foo foo' }, { path: '../bar.js', code: '"bar";' } ];
                index = require(modulePath);
            });

            teardown(function () {
                code = undefined;
            });

            test('throws an error with default options', function() {
                assert.throws(function() {
                    index.analyse(code, {});
                }, '/foo.js: Line 1: Unexpected identifier');
            });

            test('swallows error with options.ignoreErrors', function() {
                assert.doesNotThrow(function() {
                    index.analyse(code, { ignoreErrors: true });
                });
            });
        });

        suite('string source:', function () {
            var options, result;

            setup(function () {
                options = {};
                result = index.analyse('foo bar baz', options);
            });

            teardown(function () {
                options = result = undefined;
            });

            test('esprima.parse was called once', function () {
                assert.strictEqual(log.counts['esprima.parse'], 1);
            });

            test('esprima.parse was passed two arguments', function () {
                assert.lengthOf(log.args['esprima.parse'][0], 2);
            });

            test('esprima.parse was given correct source', function () {
                assert.strictEqual(log.args['esprima.parse'][0][0], 'foo bar baz');
            });

            test('esprima.parse was given correct options', function () {
                assert.isObject(log.args['esprima.parse'][0][1]);
                assert.isTrue(log.args['esprima.parse'][0][1].loc);
                assert.lengthOf(Object.keys(log.args['esprima.parse'][0][1]), 1);
            });

            test('core.analyse was called once', function () {
                assert.strictEqual(log.counts['core.analyse'], 1);
            });

            test('core.analyse was passed three arguments', function () {
                assert.lengthOf(log.args['core.analyse'][0], 3);
            });

            test('core.analyse was given correct ast', function () {
                assert.strictEqual(log.args['core.analyse'][0][0], 'esprima.parse result');
            });

            test('core.analyse was given correct walker', function () {
                assert.strictEqual(log.args['core.analyse'][0][1], walker);
            });

            test('core.analyse was given correct options', function () {
                assert.strictEqual(log.args['core.analyse'][0][2], options);
            });

            test('correct result was returned', function () {
                assert.strictEqual(result, 'core.analyse result');
            });
        });
    });
});
