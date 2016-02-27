/*globals require, exports */

'use strict';

var operatorTraits = require('./operators'), operandTraits = require('./operands');

exports.actualise = actualise;

function actualise (lloc, cyclomatic, operators, operands, children, assignableName, newScope, dependencies) {
    return {
        lloc: lloc,
        cyclomatic: cyclomatic,
        operators: operatorTraits.actualise(safeArray(operators)),
        operands: operandTraits.actualise(safeArray(operands)),
        children: safeArray(children),
        assignableName: assignableName,
        newScope: newScope,
        dependencies: dependencies
    };
}

function safeArray (thing) {
    if (typeof thing === 'undefined') {
        return [];
    }

    if (Array.isArray(thing)) {
        return thing;
    }

    return [ thing ];
}

