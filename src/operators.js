/*globals exports */

'use strict';

exports.actualise = actualiseOperators;

function actualiseOperators (properties) {
    return properties.map(function (property) {
        if (property && typeof property.identifier !== 'undefined') {
            return property;
        }

        return { identifier: property };
    });
}

