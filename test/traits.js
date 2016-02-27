'use strict';

var assert, mockery, spooks, modulePath;

assert = require('chai').assert;
mockery = require('mockery');
spooks = require('spooks');

modulePath = '../src/traits';

mockery.registerAllowable(modulePath);

suite('index:', function () {
    var log;

    setup(function () {
        log = {};
        mockery.enable({ useCleanCache: true });
        mockery.registerMock('./operands', {
            actualise: spooks.fn({
                name: 'operands.actualise',
                log: log,
                result: 'operands result'
            })
        });
        mockery.registerMock('./operators', {
            actualise: spooks.fn({
                name: 'operators.actualise',
                log: log,
                result: 'operators result'
            })
        });
    });

    teardown(function () {
        mockery.deregisterMock('./operands');
        mockery.deregisterMock('./operators');
        mockery.disable();
        log = undefined;
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

        test('actualise function is exported', function () {
            assert.isFunction(index.actualise);
        });

        test('actualise does not throw', function () {
            assert.doesNotThrow(function () {
                index.actualise();
            });
        });

        test('operators.actualise was not called', function () {
            assert.strictEqual(log.counts['operators.actualise'], 0);
        });

        test('operands.actualise was not called', function () {
            assert.strictEqual(log.counts['operands.actualise'], 0);
        });

        suite('string arguments:', function () {
            var result;

            setup(function () {
                result = index.actualise('koda', 'basanda', 'bosoya', 'umahasha', 'tikki', 'ottobo', 'heeta', 'boshatta');
            });

            teardown(function () {
                result = undefined;
            });

            test('operators.actualise was called once', function () {
                assert.strictEqual(log.counts['operators.actualise'], 1);
            });

            test('operators.actualise was called correctly', function () {
                assert.lengthOf(log.args['operators.actualise'][0], 1);
                assert.isArray(log.args['operators.actualise'][0][0]);
                assert.lengthOf(log.args['operators.actualise'][0][0], 1);
                assert.strictEqual(log.args['operators.actualise'][0][0][0], 'bosoya');
            });

            test('operands.actualise was called once', function () {
                assert.strictEqual(log.counts['operands.actualise'], 1);
            });

            test('operands.actualise was called correctly', function () {
                assert.lengthOf(log.args['operands.actualise'][0], 1);
                assert.isArray(log.args['operands.actualise'][0][0]);
                assert.lengthOf(log.args['operands.actualise'][0][0], 1);
                assert.strictEqual(log.args['operands.actualise'][0][0][0], 'umahasha');
            });

            test('result was object', function () {
                assert.isObject(result);
            });

            test('lloc was correct', function () {
                assert.strictEqual(result.lloc, 'koda');
            });

            test('cyclomatic was correct', function () {
                assert.strictEqual(result.cyclomatic, 'basanda');
            });

            test('operators was correct', function () {
                assert.strictEqual(result.operators, 'operators result');
            });

            test('operands was correct', function () {
                assert.strictEqual(result.operands, 'operands result');
            });

            test('children was correct', function () {
                assert.isArray(result.children);
                assert.lengthOf(result.children, 1);
                assert.strictEqual(result.children[0], 'tikki');
            });

            test('assignableName was correct', function () {
                assert.strictEqual(result.assignableName, 'ottobo');
            });

            test('newScope was correct', function () {
                assert.strictEqual(result.newScope, 'heeta');
            });

            test('dependencies was correct', function () {
                assert.strictEqual(result.dependencies, 'boshatta');
            });
        });

        suite('array arguments:', function () {
            var result;

            setup(function () {
                result = index.actualise('1', '2', [ '3' ], [ '4' ], [ '5' ], '6', '7', '8');
            });

            teardown(function () {
                result = undefined;
            });

            test('operators.actualise was called correctly', function () {
                assert.lengthOf(log.args['operators.actualise'][0], 1);
                assert.isArray(log.args['operators.actualise'][0][0]);
                assert.lengthOf(log.args['operators.actualise'][0][0], 1);
                assert.strictEqual(log.args['operators.actualise'][0][0][0], '3');
            });

            test('operands.actualise was called correctly', function () {
                assert.lengthOf(log.args['operands.actualise'][0], 1);
                assert.isArray(log.args['operands.actualise'][0][0]);
                assert.lengthOf(log.args['operands.actualise'][0][0], 1);
                assert.strictEqual(log.args['operands.actualise'][0][0][0], '4');
            });

            test('lloc was correct', function () {
                assert.strictEqual(result.lloc, '1');
            });

            test('cyclomatic was correct', function () {
                assert.strictEqual(result.cyclomatic, '2');
            });

            test('children was correct', function () {
                assert.isArray(result.children);
                assert.lengthOf(result.children, 1);
                assert.strictEqual(result.children[0], '5');
            });

            test('assignableName was correct', function () {
                assert.strictEqual(result.assignableName, '6');
            });

            test('newScope was correct', function () {
                assert.strictEqual(result.newScope, '7');
            });

            test('dependencies was correct', function () {
                assert.strictEqual(result.dependencies, '8');
            });
        });

        suite('no arguments:', function () {
            var result;

            setup(function () {
                result = index.actualise();
            });

            teardown(function () {
                result = undefined;
            });

            test('operators.actualise was called correctly', function () {
                assert.lengthOf(log.args['operators.actualise'][0], 1);
                assert.isArray(log.args['operators.actualise'][0][0]);
                assert.lengthOf(log.args['operators.actualise'][0][0], 0);
            });

            test('operands.actualise was called correctly', function () {
                assert.lengthOf(log.args['operands.actualise'][0], 1);
                assert.isArray(log.args['operands.actualise'][0][0]);
                assert.lengthOf(log.args['operands.actualise'][0][0], 0);
            });

            test('children was correct', function () {
                assert.isArray(result.children);
                assert.lengthOf(result.children, 0);
            });
        });
    });
});
