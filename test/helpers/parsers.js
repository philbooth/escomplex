'use strict';

var parsers = [{
    name: 'acorn',
    parser: require('acorn'),
    options: { locations: true, onComment: [] }
},{
    name: 'espree',
    parser: require('espree'),
    options: { loc: true, ecmaVersion: 6 }
},{
    name: 'esprima',
    parser: require('esprima'),
    options: { loc: true }
}];

module.exports.forEach = function forEachParser (tests) {
    for(var i = 0; i < parsers.length; i++) {
        var parserName = parsers[i].name;
        var parser = parsers[i].parser;
        var options = parsers[i].options;
        suite('using the ' + parserName + ' parser:', function () {
            tests(parserName, parser, options);
        });
    }
}

