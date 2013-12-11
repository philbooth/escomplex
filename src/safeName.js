/*globals require, module */

'use strict';

var check = require('check-types');

module.exports = function (object, defaultName) {
    if (check.object(object) && check.unemptyString(object.name)) {
        return object.name;
    }

    if (check.unemptyString(defaultName)) {
        return defaultName;
    }

    return '<anonymous>';
};
