'use strict';

var assert = require('chai').assert;
var modulePath = '../src/operators';

suite('operators:', function () {
    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var operators;

        setup(function () {
            operators = require(modulePath);
        });

        teardown(function () {
            operators = undefined;
        });

        test('actualise function is exported', function () {
            assert.isFunction(operators.actualise);
        });

        test('actualise throws when properties is object', function () {
            assert.throws(function () {
                operators.actualise({});
            });
        });

        test('actualise does not throw when properties is array', function () {
            assert.doesNotThrow(function () {
                operators.actualise([]);
            });
        });

        suite('no properties:', function () {
            var result;

            setup(function () {
                result = operators.actualise([]);
            });

            teardown(function () {
                result = undefined;
            });

            test('result was array', function () {
                assert.isArray(result);
            });

            test('result was empty', function () {
                assert.lengthOf(result, 0);
            });
        });

        suite('one property with identifier:', function () {
            var result;

            setup(function () {
                result = operators.actualise([ { identifier: 'foo' } ]);
            });

            teardown(function () {
                result = undefined;
            });

            test('result contained one item', function () {
                assert.lengthOf(result, 1);
            });

            test('first item was correct', function () {
                assert.isObject(result[0]);
                assert.strictEqual(result[0].identifier, 'foo');
            });
        });

        suite('one identifier:', function () {
            var result;

            setup(function () {
                result = operators.actualise([ 'foo' ]);
            });

            teardown(function () {
                result = undefined;
            });

            test('result contained one item', function () {
                assert.lengthOf(result, 1);
            });

            test('first item was correct', function () {
                assert.isObject(result[0]);
                assert.strictEqual(result[0].identifier, 'foo');
            });
        });

        suite('two properties:', function () {
            var result;

            setup(function () {
                result = operators.actualise([ 'bar', { identifier: 'baz' } ]);
            });

            teardown(function () {
                result = undefined;
            });

            test('result contained two items', function () {
                assert.lengthOf(result, 2);
            });

            test('first item was correct', function () {
                assert.strictEqual(result[0].identifier, 'bar');
            });

            test('second item was correct', function () {
                assert.strictEqual(result[1].identifier, 'baz');
            });
        });
    });
});
