/*globals require, module */

'use strict';

var check = require('check-types');

module.exports = function (object, defaultName) {
    if (check.object(object) && check.nonEmptyString(object.name)) {
        return object.name;
    }

    if (check.nonEmptyString(defaultName)) {
        return defaultName;
    }

    return '<anonymous>';
};
