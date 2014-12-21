/*globals exports, require */

'use strict';

var check = require('check-types'), report;

exports.analyse = analyse;

function analyse (ast, walker, options) {
    // TODO: Asynchronise

    var settings, currentReport, clearDependencies = true, scopeStack = [];

    check.assert.object(ast, 'Invalid syntax tree');
    check.assert.object(walker, 'Invalid walker');
    check.assert.function(walker.walk, 'Invalid walker.walk method');

    if (check.object(options)) {
        settings = options;
    } else {
        settings = getDefaultSettings();
    }

    // TODO: loc is moz-specific, move to walker?
    report = createReport(ast.loc);

    walker.walk(ast, settings, {
        processNode: processNode,
        createScope: createScope,
        popScope: popScope
    });

    calculateMetrics(settings);

    return report;

    function processNode (node, syntax) {
        processLloc(node, syntax, currentReport);
        processCyclomatic(node, syntax, currentReport);
        processOperators(node, syntax, currentReport);
        processOperands(node, syntax, currentReport);

        if (processDependencies(node, syntax, clearDependencies)) {
            // HACK: This will fail with async or if other syntax than CallExpression introduces dependencies.
            // TODO: Come up with a less crude approach.
            clearDependencies = false;
        }
    }

    function createScope (name, loc, parameterCount) {
        currentReport = createFunctionReport(name, loc, parameterCount);

        report.functions.push(currentReport);
        report.aggregate.params += parameterCount;

        scopeStack.push(currentReport);
    }

    function popScope () {
        scopeStack.pop();

        if (scopeStack.length > 0) {
            currentReport = scopeStack[scopeStack.length - 1];
        } else {
            currentReport = undefined;
        }
    }
}

function getDefaultSettings () {
    return {
        logicalor: true,
        switchcase: true,
        forin: false,
        trycatch: false,
        newmi: false
    };
}

function createReport (lines) {
    return {
        aggregate: createFunctionReport(undefined, lines, 0),
        functions: [],
        dependencies: []
    };
}

function createFunctionReport (name, lines, params) {
    var result = {
        name: name,
        sloc: {
            logical: 0
        },
        cyclomatic: 1,
        halstead: createInitialHalsteadState(),
        params: params
    };

    if (check.object(lines)) {
        result.line = lines.start.line;
        result.sloc.physical = lines.end.line - lines.start.line + 1;
    }

    return result;
}

function createInitialHalsteadState () {
    return {
        operators: createInitialHalsteadItemState(),
        operands: createInitialHalsteadItemState()
    };
}

function createInitialHalsteadItemState () {
    return {
        distinct: 0,
        total: 0,
        identifiers: []
    };
}

function processLloc (node, syntax, currentReport) {
    incrementCounter(node, syntax, 'lloc', incrementLogicalSloc, currentReport);
}

function incrementCounter (node, syntax, name, incrementFn, currentReport) {
    var amount = syntax[name];

    if (check.number(amount)) {
        incrementFn(currentReport, amount);
    } else if (check.function(amount)) {
        incrementFn(currentReport, amount(node));
    }
}

function incrementLogicalSloc (currentReport, amount) {
    report.aggregate.sloc.logical += amount;

    if (currentReport) {
        currentReport.sloc.logical += amount;
    }
}

function processCyclomatic (node, syntax, currentReport) {
    incrementCounter(node, syntax, 'cyclomatic', incrementCyclomatic, currentReport);
}

function incrementCyclomatic (currentReport, amount) {
    report.aggregate.cyclomatic += amount;

    if (currentReport) {
        currentReport.cyclomatic += amount;
    }
}

function processOperators (node, syntax, currentReport) {
    processHalsteadMetric(node, syntax, 'operators', currentReport);
}

function processOperands (node, syntax, currentReport) {
    processHalsteadMetric(node, syntax, 'operands', currentReport);
}

function processHalsteadMetric (node, syntax, metric, currentReport) {
    if (check.array(syntax[metric])) {
        syntax[metric].forEach(function (s) {
            var identifier;

            if (check.function(s.identifier)) {
                identifier = s.identifier(node);
            } else {
                identifier = s.identifier;
            }

            if (check.function(s.filter) === false || s.filter(node) === true) {
                halsteadItemEncountered(currentReport, metric, identifier);
            }
        });
    }
}

function halsteadItemEncountered (currentReport, metric, identifier) {
    if (currentReport) {
        incrementHalsteadItems(currentReport, metric, identifier);
    }

    incrementHalsteadItems(report.aggregate, metric, identifier);
}

function incrementHalsteadItems (baseReport, metric, identifier) {
    incrementDistinctHalsteadItems(baseReport, metric, identifier);
    incrementTotalHalsteadItems(baseReport, metric);
}

function incrementDistinctHalsteadItems (baseReport, metric, identifier) {
    if (Object.prototype.hasOwnProperty(identifier)) {
        // Avoid clashes with built-in property names.
        incrementDistinctHalsteadItems(baseReport, metric, '_' + identifier);
    } else if (isHalsteadMetricDistinct(baseReport, metric, identifier)) {
        recordDistinctHalsteadMetric(baseReport, metric, identifier);
        incrementHalsteadMetric(baseReport, metric, 'distinct');
    }
}

function isHalsteadMetricDistinct (baseReport, metric, identifier) {
    return baseReport.halstead[metric].identifiers.indexOf(identifier) === -1;
}

function recordDistinctHalsteadMetric (baseReport, metric, identifier) {
    baseReport.halstead[metric].identifiers.push(identifier);
}

function incrementHalsteadMetric (baseReport, metric, type) {
    if (baseReport) {
        baseReport.halstead[metric][type] += 1;
    }
}

function incrementTotalHalsteadItems (baseReport, metric) {
    incrementHalsteadMetric(baseReport, metric, 'total');
}

function processDependencies (node, syntax, clearDependencies) {
    var dependencies;

    if (check.function(syntax.dependencies)) {
        dependencies = syntax.dependencies(node, clearDependencies);
        if (check.object(dependencies) || check.array(dependencies)) {
            report.dependencies = report.dependencies.concat(dependencies);
        }

        return true;
    }

    return false;
}

function calculateMetrics (settings) {
    var i, data, averages,

    sums = [ 0, 0, 0, 0 ],

    indices = {
        loc: 0,
        cyclomatic: 1,
        effort: 2,
        params: 3
    };

    for (i = 0; i < report.functions.length; i += 1) {
        data = report.functions[i];

        calculateCyclomaticDensity(data);
        calculateHalsteadMetrics(data.halstead);
        sumMaintainabilityMetrics(sums, indices, data);
    }

    calculateCyclomaticDensity(report.aggregate);
    calculateHalsteadMetrics(report.aggregate.halstead);
    if (i === 0) {
        // Sane handling of modules that contain no functions.
        sumMaintainabilityMetrics(sums, indices, report.aggregate);
        i = 1;
    }

    averages = sums.map(function (sum) { return sum / i; });

    calculateMaintainabilityIndex(
        averages[indices.effort],
        averages[indices.cyclomatic],
        averages[indices.loc],
        settings
    );

    report.params = averages[indices.params];
}

function calculateCyclomaticDensity (data) {
    data.cyclomaticDensity = (data.cyclomatic / data.sloc.logical) * 100;
}

function calculateHalsteadMetrics (data) {
    data.length = data.operators.total + data.operands.total;
    if (data.length === 0) {
        nilHalsteadMetrics(data);
    } else {
        data.vocabulary = data.operators.distinct + data.operands.distinct;
        data.difficulty =
            (data.operators.distinct / 2) *
            (data.operands.distinct === 0 ? 1 : data.operands.total / data.operands.distinct);
        data.volume = data.length * (Math.log(data.vocabulary) / Math.log(2));
        data.effort = data.difficulty * data.volume;
        data.bugs = data.volume / 3000;
        data.time = data.effort / 18;
    }
}

function nilHalsteadMetrics (data) {
    data.vocabulary =
        data.difficulty =
        data.volume =
        data.effort =
        data.bugs =
        data.time =
            0;
}

function sumMaintainabilityMetrics (sums, indices, data) {
    sums[indices.loc] += data.sloc.logical;
    sums[indices.cyclomatic] += data.cyclomatic;
    sums[indices.effort] += data.halstead.effort;
    sums[indices.params] += data.params;
}

function calculateMaintainabilityIndex (averageEffort, averageCyclomatic, averageLoc, settings) {
    if (averageCyclomatic === 0) {
        throw new Error('Encountered function with cyclomatic complexity zero!');
    }

    report.maintainability =
        171 -
        (3.42 * Math.log(averageEffort)) -
        (0.23 * Math.log(averageCyclomatic)) -
        (16.2 * Math.log(averageLoc));

    if (report.maintainability > 171) {
        report.maintainability = 171;
    }

    if (settings.newmi) {
        report.maintainability = Math.max(0, (report.maintainability * 100) / 171);
    }
}

