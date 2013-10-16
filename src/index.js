/**
 * Code complexity reporting for Mozilla-format abstract syntax trees.
 */

/*globals exports, require */

'use strict';

var check = require('check-types');

exports.analyse = analyse;

/**
 * Public function `analyse`.
 *
 * Returns an object detailing the complexity of abstract syntax tree(s).
 *
 * @param ast {object|array}  The abstract syntax tree(s) to analyse for
 *                            code complexity.
 * @param [options] {object}  Options to modify the complexity calculation.
 *
 */
function analyse (ast, options) {
    if (check.isArray(ast)) {
        return require('./project').analyse(ast, options);
    }

    return require('./module').analyse(ast, options);
}

