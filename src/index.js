/*globals require, exports */
'use strict';

var _ = require('lodash');
var esprima = require('esprima');
var walker = require('./walker');
var core = require('./core');

module.exports.analyse = function analyse (source, options, parsing) {
    var ast;
    var parser = defaultParser;
    var parserOptions = {
        loc: true
    };

    if (typeof parsing === 'function') {
        parser = parsing;
    }

    if (typeof parsing === 'object') {
        _.extend(parserOptions, parsing);
    }

    // We must enable locations for the
    // resulting AST, otherwise the metrics
    // will be missing line information.
    parserOptions.loc = true;

    if (Array.isArray(source)) {
        ast = parseProject(source, parser, parserOptions, options);
    } else {
        ast = parser(source, parserOptions);
    }

    return core.analyse(ast, walker, options);
}

function defaultParser (source, parserOptions) {
    return esprima.parse(source, parserOptions);
}

function parseProject (sources, parser, parserOptions, options) {
    return sources
        .map(function parseProjectModule(source) {
            try {
                return {
                    path: source.path,
                    ast: parser(source.code, parserOptions)
                };
            } catch (error) {
                if (options.ignoreErrors) {
                    return null;
                }

                error.message = source.path + ': ' + error.message;
                throw error;
            }
        })
        .filter(_.negate(_.isNil));
}

