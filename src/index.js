/**
 * Code complexity reporting for Mozilla-format abstract syntax trees.
 */

/*globals exports, require */

'use strict';

var check = require('check-types'),
    projectHandler = require('./project'),
    moduleHandler = require('./module');


exports.analyse = analyse;
exports.processResults = processResults;

/**
 * Public function `analyse`.
 *
 * Returns an object detailing the complexity of abstract syntax tree(s).
 *
 * @param ast {object|array}  The abstract syntax tree(s) to analyse for
 *                            code complexity.
 * @param walker {object}     The AST walker to use against `ast`.
 * @param [options] {object}  Options to modify the complexity calculation.
 *
 */
function analyse (ast, walker, options) {
    if (check.array(ast)) {
        return projectHandler.analyse(ast, walker, options);
    }

    return moduleHandler.analyse(ast, walker, options);
}

/**
 * Public function `processResults`.
 *
 * Given an object with an array of results, it returns results with calculated aggregate values.
 *
 * @param report {object}  The report object with an array of results for calculating aggregates.
 * @param noCoreSize {boolean} Don't compute coresize or the visibility matrix.
 *
 */
function processResults(report, noCoreSize) {
    return projectHandler.processResults(report, noCoreSize);
}
