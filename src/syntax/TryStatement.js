/*globals require, exports */

'use strict';

var traits = require('../traits');

exports.get = get;

function get () {
    return traits.actualise(1, 0, undefined, undefined, [ 'block', 'handlers' ]);
}

