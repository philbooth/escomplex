# Metrics

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
* [Think Twice Before Using the “Maintainability Index”][maintainability-index] by Arie van Deursen.
* [A Systematic Review of Software Maintainability Prediction and Metrics][review],
  by Mehwish Riaz, Emilia Mendes and Ewan Tempero.


