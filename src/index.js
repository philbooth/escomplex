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
 * @param walker {object}     The AST walker to use against `ast`.
 * @param [options] {object}  Options to modify the complexity calculation.
 *
 */
function analyse (ast, walker, options) {
    if (check.array(ast)) {
        return require('./project').analyse(ast, walker, options);
    }

    return require('./module').analyse(ast, walker, options);
}

