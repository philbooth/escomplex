/*globals require, exports */
'use strict';

var check = require('check-types');
var esprima = require('esprima');
var walker = require('./walker');
var core = require('./core');

exports.analyse = analyse;

function analyse (source, options) {
    if (check.array(source)) {
        return analyseSources(source, options);
    }

    return analyseSource(source, options);
}

function analyseSources (sources, options) {
    return performAnalysis(
        sources.map(
            mapSource.bind(null, options)
        ).filter(filterSource),
        options
    );
}

function mapSource (options, source) {
    try {
        return {
            path: source.path,
            ast: getSyntaxTree(source.code)
        };
    } catch (error) {
        if (options.ignoreErrors) {
            return null;
        }

        error.message = source.path + ': ' + error.message;
        throw error;
    }
}

function filterSource (source) {
    return !!source;
}

function getSyntaxTree (source) {
    return esprima.parse(source, { loc: true });
}

function performAnalysis (ast, options) {
    return core.analyse(ast, walker, options);
}

function analyseSource (source, options) {
    return performAnalysis(getSyntaxTree(source), options);
}
