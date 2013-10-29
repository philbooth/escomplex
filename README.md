# escomplex

[![Build status][ci-image]][ci-status]

Software complexity analysis
of JavaScript-family abstract syntax trees.

* [Abstract syntax trees](#abstract-syntax-trees)
* [Metrics](#metrics)
* [Links to research](#links-to-research)
* [Installation](#installation)
* [Usage](#usage)
* [Related projects](#related-projects)
* [Development](#development)
* [License](#license)

## Abstract syntax trees

This library deliberately excludes
both logic for parsing source code
and logic for navigating parse trees.
Both the parsed data format
and a program that can process that format
are inputs to escomplex.
This means that it is not tied
to any particular source language.
All that's required
are an abstract syntax tree
containing enough data
from which to calculate
the complexity metrics
and a JavaScript library
that extracts that data
according to the interface
defined here.

Currently,
one such library
has been written,
[escomplex-ast-moz],
which walks the
syntax tree format
defined in
Mozilla's [Parser API][api].
That format is returned
by [Esprima]
and [Acorn],
two popular JavaScript parsers.

Initial work
is also underway
on [escomplex-ast-csr],
which aims to fulfill
the same role
for the syntax tree format
used by the parser
in [CoffeeScriptRedux].

## Metrics

Currently the library reports on:

* Lines of code:
  Both physical (the number of lines in a module or function)
  and logical (a count of the imperative statements).
* Number of parameters:
  Analysed at the function defintion
  rather than the call site,
  so no accounting is done
  for functions that use the `arguments` object.
* Cyclomatic complexity:
  Defined by Thomas J. McCabe in 1976,
  this is effectively
  the number of distinct paths
  through a block of code.
* Halstead metrics:
  Defined by Maurice Halstead in 1977,
  these metrics are calculated
  from the numbers of operators
  and operands in each function.
* Maintainability index:
  Defined by Paul Oman & Jack Hagemeister in 1991,
  this is a logarithmic scale
  from negative infinity to 171,
  calculated from
  the logical lines of code,
  the cyclomatix complexity
  and the Halstead effort.
* Dependencies (CommonJS and AMD):
  Based on calls to `require`,
  doesn't acccount for dynamic calls
  where a variable or function is
  obscuring the nature of the dependency.
* First-order density:
  The percentage of all possible internal dependencies
  that are actually realised in the project.
* Change cost:
  The percentage of modules affected,
  on average,
  when one module in the project
  is changed;
* Core size.

## Links to research

* [A Complexity Measure][mccabe].
* [Cyclomatic Complexity Density and Software Maintenance Productivity][gillkemerer].
* [Exploring the Structure of Complex Software Designs: An Empirical Study of Open Source and Proprietary Code][dsm].

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

[ci-image]: https://secure.travis-ci.org/philbooth/escomplex.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/escomplex
[escomplex-ast-moz]: https://github.com/philbooth/escomplex-ast-moz
[api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
[esprima]: http://esprima.org/
[acorn]: http://marijnhaverbeke.nl/acorn
[escomplex-ast-csr]: https://github.com/philbooth/escomplex-ast-csr
[coffee]: https://github.com/michaelficarra/CoffeeScriptRedux
[mccabe]: http://www.literateprogramming.com/mccabe.pdf
[gillkemerer]: http://www.pitt.edu/~ckemerer/CK%20research%20papers/CyclomaticComplexityDensity_GillKemerer91.pdf
[omanhagemeister]: http://www.sciencedirect.com/science/article/pii/0164121294900671
[dsm]: http://www.people.hbs.edu/cbaldwin/DR2/MRBDesignStructure17thSep1.pdf
[license]: https://github.com/philbooth/escomplex/blob/master/COPYING
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

