# escomplex

THIS PROJECT IS (kind of) BRAND NEW AND NOT SAFE TO USE YET! :)

[![Build status][ci-image]][ci-status]

A library for reporting code complexity metrics
in Mozilla-format abstract syntax trees.

* [Metrics][#metrics]
* [Abstract syntax trees][#abstract-syntax-trees]
* [Installation][#installation]
* [Usage][#usage]
* [Related projects][#related-projects]
* [Development][#development]
* [License][#license]

## Metrics

Currently the library reports on:

* lines of code;
* number of parameters;
* cyclomatic complexity;
* Halstead metrics;
* maintainability index;
* dependencies (CommonJS and AMD);
* first-order density.

## Abstract syntax trees

Mozilla's [Parser API][api]
has become a de-facto standard
for the in-memory data representation
of parsed JavaScript programs.
It defines an abstract syntax tree format
composed of objects that publish their type information,
allowing consuming programs to easily navigate those trees
using generic logic.

By accepting a syntax tree
in such a widely supported format,
escomplex is decoupled from
a specific input language.
Any language
that compiles to JavaScript
and has a conforming parser
can be the subject of
complexity analysis by this library.

Some examples of conforming parsers are:

* [Esprima][esprima];
* [Acorn][acorn];
* [CoffeeScriptRedux][coffee];
* [LiveScript][live];

## Installation

The library is published on npm
under the name `escomplex`.
To install,
you can add it to the dependencies
in your `package.json` file
or simply run:

```
npm install escomplex
```

## Usage

You can load escomplex
in your own code
by calling `require`:

```javascript
var escomplex = require('escomplex');
```

It exports one function,
called `analyse`:

```javascript
var result = escomplex.analyse(ast, options);
```

The first argument, `ast`,
must be either
an abstract syntax tree
as defined by Mozilla's Parser API
or an array of said syntax trees.

The second argument, `options`,
is an optional object
containing properties that modify some of the complexity calculations:

* `options.logicalor`:
  Boolean indicating whether operator `||`
  should be considered a source of cyclomatic complexity,
  defaults to `true`.
* `options.switchcase`:
  Boolean indicating whether `switch` statements
  should be considered a source of cyclomatic complexity,
  defaults to `true`.
* `options.forin`:
  Boolean indicating whether `for`...`in` loops
  should be considered a source of cyclomatic complexity,
  defaults to `false`.
* `options.trycatch`:
  Boolean indicating whether `catch` clauses
  should be considered a source of cyclomatic complexity,
  defaults to `false`.
* `options.newmi`:
  Boolean indicating whether the maintainability
  index should be rebased on a scale from 0 to 100,
  defaults to `false`.

If a single abstract syntax tree object
is passed in the `ast` argument,
the result will be a report object
detailing the complexity of that syntax tree.
If `ast` is an array,
the result will be an array of complexity reports.

TODO: Properties on the returned object

## Related projects

TODO

## Development

TODO

## What license is it released under?

[MIT][license]

[ci-image]: https://secure.travis-ci.org/philbooth/complexityReport.js.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/complexityReport.js
[api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
[esprima]: http://esprima.org/
[acorn]: http://marijnhaverbeke.nl/acorn
[coffee]: https://github.com/michaelficarra/CoffeeScriptRedux
[live]: https://github.com/gkz/LiveScript
[license]: https://github.com/philbooth/complexityReport.js/blob/master/COPYING
[msvariant]: http://blogs.msdn.com/b/codeanalysis/archive/2007/11/20/maintainability-index-range-and-meaning.aspx
[jarrod]: http://jarrodoverson.com/blog/about
[plato]: https://github.com/jsoverson/plato
[grunt-complexity]: https://github.com/vigetlabs/grunt-complexity
[bob]: https://github.com/cliffano/bob
[cardio]: https://github.com/auchenberg/cardio
[brackets-crjs]: https://github.com/sahlas/brackets-crjs
[node]: http://nodejs.org/
[npm]: https://npmjs.org/
[jshint]: https://github.com/jshint/node-jshint
[mocha]: http://visionmedia.github.com/mocha
[chai]: http://chaijs.com/

