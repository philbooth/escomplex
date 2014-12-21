# escomplex

[![Build status][ci-image]][ci-status]

Software complexity analysis
of JavaScript-family abstract syntax trees.
The back-end for [complexity-report].

* [Abstract syntax trees](#abstract-syntax-trees)
* [Syntax tree walkers](#syntax-tree-walkers)
* [Metrics](#metrics)
* [Links to research](#links-to-research)
* [Installation](#installation)
* [Usage](#usage)
    * [Arguments](#arguments)
        * [ast](#ast)
        * [walker](#walker)
        * [options](#options)
    * [Result](#result)
        * [For a single module](#for-a-single-module)
        * [For multiple modules](#for-multiple-modules)
* [Related projects](#related-projects)
* [Development](#development)
* [License](#license)

## Abstract syntax trees

This library deliberately excludes
logic for parsing source code
and for navigating parse trees.
Both the syntax tree
and a matching [syntax tree walker](#syntax-tree-walkers)
are inputs to escomplex,
meaning it is not tied
to any particular language,
parser
or data format.

## Syntax tree walkers

* [escomplex-ast-moz]:
  Walks syntax trees
  that conform to the format
  defined in Mozilla's [Parser API][api].
  This format is returned
  by [Esprima]
  and [Acorn],
  two popular JavaScript parsers.

## Metrics

Currently the library reports on:

* Lines of code:
  Both physical (the number of lines in a module or function)
  and logical (a count of the imperative statements).
  A crude measure.
* Number of parameters:
  Analysed statically
  from the function signature,
  so no accounting is made
  for functions that rely on the `arguments` object.
  Lower is better.
* Cyclomatic complexity:
  Defined by Thomas J. McCabe in 1976,
  this is a count of the number of cycles
  in the program flow control graph.
  Effectively the number of distinct paths
  through a block of code.
  Lower is better.
* Cyclomatic complexity density:
  Proposed as a modification
  to cyclomatic complexity
  by Geoffrey K. Gill and Chris F. Kemerer in 1991,
  this metric simply re-expresses it
  as a percentage of the logical lines of code.
  Lower is better.
* Halstead metrics:
  Defined by Maurice Halstead in 1977,
  these metrics are calculated
  from the numbers of operators
  and operands in each function.
  Lower is better.
* Maintainability index:
  Defined by Paul Oman & Jack Hagemeister in 1991,
  this is a logarithmic scale
  from negative infinity to 171,
  calculated from
  the logical lines of code,
  the cyclomatix complexity
  and the Halstead effort.
  Higher is better.
* Dependencies:
  A count of the calls
  to CommonJS and AMD `require`.
  Analysed statically
  from the function signature,
  so no accounting is made
  for dynamic calls
  where a variable or function is
  obscuring the nature of the dependency.
  Lower is better.
* First-order density:
  The percentage of all possible internal dependencies
  that are actually realised in the project.
  Lower is better.
* Change cost:
  The percentage of modules affected,
  on average,
  when one module in the project
  is changed.
  Lower is better.
* Core size:
  The percentage of modules
  that are both widely depended on
  and themselves depend on other modules.
  Lower is better.

It is important to note
that none of these metrics
can compete with the insight
of a competent developer.
At best,
they are an automatable warning system,
which can help to identify areas of code
that warrant closer inspection
by a human being.

## Links to research

* [A Complexity Measure][mccabe],
  by Thomas J McCabe.
* [Cyclomatic Complexity Density and Software Maintenance Productivity][gillkemerer],
  by Geoffrey K. Gill and Chris F. Kemerer.
* [Resolving the Mysteries of the Halstead Measures][horstzuse],
  by Horst Zuse.
* [Exploring the Structure of Complex Software Designs: An Empirical Study of Open Source and Proprietary Code][dsm],
  by Alan MacCormack, John Rusnak and Carliss Baldwin.
* [The Impact of Software Design Structure on Product Maintenance Costs and Measurement of Economic Benefits of Product Redesign][akaikine],
  by Andrei Akaikine.
* [A Systematic Review of Software Maintainability Prediction and Metrics][review],
  by Mehwish Riaz, Emilia Mendes and Ewan Tempero.

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
var result = escomplex.analyse(ast, walker, options);
```

### Arguments

#### ast

The first argument, `ast`,
must be either
an abstract syntax tree
or an array of syntax trees.
If it is an array,
each tree should include
an extra property, `path`,
that is either a relative or full path
to the equivalent module on disk.
As well as identifying
each of the result objects,
that path is also used
during dependency analysis.

#### walker

The second argument, `walker`,
must be a [syntax tree walker](#syntax-tree-walkers).

#### options

The third argument, `options`,
is an optional object
containing properties that modify
some of the complexity calculations:

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

### Result

#### For a single module

If a single abstract syntax tree object
is passed in the `ast` argument,
the result will be a report object
that looks like the following:

```javascript
{
    maintainability: 171,
    dependencies: [],
    aggregate: {
        sloc: {
            logical: 0,
            physical: 0
        },
        params: 0,
        cyclomatic: 1,
        cyclomaticDensity: 1,
        halstead: {
            vocabulary: 0,
            difficulty: 0,
            volume: 0,
            effort: 0,
            bugs: 0,
            time: 0
        }
    },
    functions: [
        {
            name: '',
            line: 0,
            sloc: {
                logical: 0,
                physical: 0
            },
            params: 0,
            cyclomatic: 1,
            cyclomaticDensity: 1,
            halstead: {
                vocabulary: 0,
                difficulty: 0,
                volume: 0,
                effort: 0,
                bugs: 0,
                time: 0
            }
        },
        ...
    ]
}
```

The meaning of those values, briefly,
is as follows
(see [metrics](#metrics)
for more information
on each one):

* `report.maintainability`:
  The maintainability index for the module.
* `report.dependencies`:
  The array of CommonJS/AMD dependencies for the module.
* `report.aggregate.sloc.physical`:
  Physical lines of code for the module.
  Will be `undefined`
  if the syntax tree
  is not annotated
  with line number data.
* `report.aggregate.sloc.logical`:
  Logical lines of code for the module.
* `report.aggregate.params`:
  Parameter count for the module.
* `report.aggregate.cyclomatic`:
  Cyclomatic complexity for the module.
* `report.aggregate.cyclomaticDensity`:
  Cyclomatic complexity density for the module.
* `report.aggregate.halstead.vocabulary`:
  Halstead vocabulary size for the module.
* `report.aggregate.halstead.difficulty`:
  Halstead difficulty for the module.
* `report.aggregate.halstead.volume`:
  Halstead volume for the module.
* `report.aggregate.halstead.effort`:
  Halstead effort for the module.
* `report.aggregate.halstead.bugs`:
  Halstead bugs for the module.
* `report.aggregate.halstead.time`:
  Halstead time for the module.
* `report.functions[n].name`:
  Function name.
* `report.functions[n].line`:
  Line number that the function starts on.
  Will be `undefined`
  if the syntax tree
  is not annotated
  with line number data.
* `report.functions[n].sloc.physical`:
  Physical lines of code for the function.
  Will be `undefined`
  if the syntax tree
  is not annotated
  with line number data.
* `report.functions[n].sloc.logical`:
  Logical lines of code for the function.
* `report.functions[n].params`:
  Parameter count for the function.
* `report.functions[n].cyclomatic`:
  Cyclomatic complexity for the function.
* `report.functions[n].cyclomaticDensity`:
  Cyclomatic complexity density for the function.
* `report.functions[n].halstead.vocabulary`:
  Halstead vocabulary size for the function.
* `report.functions[n].halstead.difficulty`:
  Halstead difficulty for the function.
* `report.functions[n].halstead.volume`:
  Halstead volume for the function.
* `report.functions[n].halstead.effort`:
  Halstead effort for the function.
* `report.functions[n].halstead.bugs`:
  Halstead bugs for the function.
* `report.functions[n].halstead.time`:
  Halstead time for the function.

#### For multiple modules

If an array of syntax trees
is passed in the `ast` argument,
the result will be an object
that looks like the following:

```javascript
{
    reports: [
        ...
    ],
    adjacencyMatrix: [
        [ 0 ]
    ],
    firstOrderDensity: 0,
    visibilityMatrix: [
        [ 0 ]
    ],
    changeCost: 100,
    coreSize: 100
}
```

Those properties
are defined as follows:

* `result.reports`:
  An array of report objects,
  each one in the same format
  [described above](#for-a-single-module)
  but with an extra property `path`
  that matches the `path` property
  from its corresponding syntax tree.
  This `path` property is required
  because the reports array gets sorted
  during dependency analysis.
* `result.adjacencyMatrix`:
  The adjacency
  design structure matrix (DSM)
  for the project.
  This is a two-dimensional array,
  each dimension with the same order and length
  as the `reports` array.
  Each row and column
  represents its equivalent
  indexed module
  from the `reports` array,
  with values along the horizontal
  being `1`
  when that module
  directly depends on another
  and values along the vertical
  being `1`
  when that module
  is directly depended on by another.
  All other values are `0`.
* `result.firstOrderDensity`:
  The first-order density for the project.
* `result.visibilityMatrix`:
  The visibility DSM for the project.
  Like the adjacency matrix,
  but expanded to incorporate
  indirect dependencies.
* `result.changeCost`:
  The change cost for the project.
* `result.coreSize`:
  The core size for the project.

## Related projects

* [plato]:
  JavaScript source code visualization, static analysis, and complexity tool.
* [jsc]:
  JavaScript source code complexity tool.
* [bob]:
  Minimalist-omakase build tool for node.js projects.
* [cardio]:
  A web application health tool.
* [grunt-complexity][grunt]:
  A JavaScript complexity analysis grunt task.
* [brackets-crjs][brackets]:
  Brackets extension.
* [jscomplexity]:
  JS cyclomatic complexity report generator.
* [karma-complexity-processor][karma]:
  A preprocessor for karma runner to give some metrics about code complexity.
* [crlint]:
  JS linter based on complexity report results.

## Development

Refer to the [contrubution guidelines][contributions]
before submitting a pull request.

Source code is in `/src`.
Unit tests are in `/test`.
You can run the tests with `npm test`.
You can run the linter with `npm run lint`.
Make sure you've installed
all the dependencies
with `npm install`
first.

## License

[MIT][license]

[ci-image]: https://secure.travis-ci.org/philbooth/escomplex.png?branch=master
[ci-status]: http://travis-ci.org/#!/philbooth/escomplex
[complexity-report]: https://github.com/philbooth/complexity-report
[escomplex-ast-moz]: https://github.com/philbooth/escomplex-ast-moz
[api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
[esprima]: http://esprima.org/
[acorn]: http://marijnhaverbeke.nl/acorn
[mccabe]: http://www.literateprogramming.com/mccabe.pdf
[gillkemerer]: http://www.pitt.edu/~ckemerer/CK%20research%20papers/CyclomaticComplexityDensity_GillKemerer91.pdf
[horstzuse]: http://horst-zuse.homepage.t-online.de/z-halstead-final-05-1.pdf
[dsm]: http://www.people.hbs.edu/cbaldwin/DR2/MRBDesignStructure17thSep1.pdf
[akaikine]: http://sdm.mit.edu/docs/akaikine_thesis.pdf
[review]: http://www.rose-hulman.edu/Users/faculty/young/CS-Classes/csse575/Resources/maintainabilityMeas05314233.pdf
[plato]: https://github.com/es-analysis/plato
[jsc]: https://github.com/bahmutov/js-complexity-viz
[bob]: https://github.com/cliffano/bob
[cardio]: https://github.com/auchenberg/cardio
[grunt]: https://github.com/vigetlabs/grunt-complexity
[brackets]: https://github.com/sahlas/brackets-crjs
[jscomplexity]: https://github.com/slyg/jscomplexity
[karma]: https://github.com/lorenzofox3/karma-complexity-preprocessor
[crlint]: https://github.com/spion/crlint.js
[contributions]: https://github.com/philbooth/escomplex/blob/master/CONTRIBUTING.md
[license]: https://github.com/philbooth/escomplex/blob/master/COPYING

