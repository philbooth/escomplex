'use strict';

var assert = require('chai').assert;
var escomplex = require('../src');
var espree = require('espree');

suite('index parser overrides', function () {
    test('AST callback for module does not alter behavior', function () {
        var wasCalled = false;
        var expected = escomplex.analyse('var a;', {});
        var actual = escomplex.analyse(
            'var a;',
            {},
            function (source) {
                wasCalled = true;
                return espree.parse(source, { loc: true });
            }
        );
        assert.ok(wasCalled);
        assert.deepEqual(expected, actual);
    });

    test('overriding parser fn does not alter behavior for project', function () {
        var sources = [{
            path: 'one',
            source: 'var a;'
        }, {
            path: 'two',
            source: 'var b;'
        }];
        var callCount = 0;
        var expected = escomplex.analyse(sources, {});
        var actual = escomplex.analyse(
            sources,
            {},
            function (source) {
                callCount++;
                return espree.parse(source, { loc: true });
            }
        );
        assert.equal(callCount, sources.length);
        assert.deepEqual(expected, actual);
    });

    test('overriding parser options does not alter behavior', function () {
        var sources = [{
            path: 'one',
            source: 'var a;'
        }, {
            path: 'two',
            source: 'var b;'
        }];
        var expected = escomplex.analyse(sources, {});
        var actual = escomplex.analyse(
            sources,
            {},
            {
                loc: false,
                range: true
            }
        );
        assert.deepEqual(expected, actual);
    });
});
