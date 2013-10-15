# escomplex

THIS PROJECT IS (kind of) BRAND NEW AND NOT SAFE TO USE YET! :)

[![Build status][ci-image]][ci-status]

A library
for reporting code complexity metrics
in Mozilla-format abstract syntax trees.

## Code complexity metrics?

Currently the library reports on:

* lines of code;
* number of parameters;
* cyclomatic complexity;
* Halstead metrics;
* maintainability index;
* dependencies (CommonJS and AMD);
* first-order density.

## Abstract syntax trees?

Mozilla's [Parser API][api]
has become a de-facto standard
in-memory data format
for parsed JavaScript programs.
By accepting a syntax tree
in such a widely supported format,
escomplex is decoupled from
any one specific input language.
Thus any language
that compiles to JavaScript
and has a conforming parser
can be the subject of
the complexity analysis within.

Some examples of conforming parsers are:

* [Esprima][esprima];
* [Acorn][acorn];
* [CoffeeScriptRedux][coffee];
* [LiveScript][live];

## How do I use it?

The library is published on npm
under the name `escomplex`.
You can add it to the dependencies
in your `package.json` file
or simply run:

```
npm install escomplex
```

There are two entry points to escomplex,
one for individual modules,
the other for entire projects.
Depending on which of those suits,
you'll want to `require` it
in one of two ways:

```javascript
var escomplex = require('escomplex/module');
```

```javascript
var escomplex = require('escomplex/project');
```

Regardless of which option you choose,
you can then invoke escomplex by calling:

```javascript
escomplex.analyse(ast, options);
```

The main difference between the two signatures
is the `ast` argument,
which is an abstract syntax tree
in the module call
and an array of abstract syntax trees
in the project call.

The `options` argument is the same for both,
an optional object containing properties
that modify some of the complexity calculations:

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
  index should be rebased on a scale from 0 to 100.

The other difference in the two calls
is the return value.
For modules it is a single report object
and for projects it is an object
that contains an array of reports
and an array of dependency matrices.

## What license is it released under?

[MIT][license]

## Related projects

TODO

## Development

TODO

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

