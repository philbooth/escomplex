/*globals exports, require */

'use strict';

var path, check, matrix, moduleAnalyser;

exports.analyse = analyse;

path = require('path');
check = require('check-types');
matrix = require('matrix-utilities');
moduleAnalyser = require('./module');

function analyse (modules, walker, options) {
    // TODO: Asynchronize.

    var reports, result;

    check.assert.array(modules, 'Invalid modules');

    reports = modules.map(function (m) {
        var report;

        check.assert.unemptyString(m.path, 'Invalid path');

        try {
            report = moduleAnalyser.analyse(m.ast, walker, options);

            report.path = m.path;

            return report;
        } catch (error) {
            // These error messages are useless unless they contain the error message.
            error.message = m.path + ': ' + error.message;
            throw error;
        }
    }, []);

    result = {
        reports: reports,
    };

    createAdjacencyMatrix(result);
    createVisibilityMatrix(result);
    setCoreSize(result);

    return result;
}

function createAdjacencyMatrix (result) {
    var adjacencyMatrix = new Array(result.reports.length), density = 0;

    result.reports.sort(function (lhs, rhs) {
        return comparePaths(lhs.path, rhs.path);
    }).forEach(function (ignore, x) {
        adjacencyMatrix[x] = new Array(result.reports.length);
        result.reports.forEach(function (ignore, y) {
            adjacencyMatrix[x][y] = getAdjacencyMatrixValue(result.reports, x, y);
            if (adjacencyMatrix[x][y] === 1) {
                density += 1;
            }
        });
    });

    result.adjacencyMatrix = adjacencyMatrix;
    result.firstOrderDensity = percentifyDensity(density, adjacencyMatrix);
}

function comparePaths (lhs, rhs) {
    var lsplit = lhs.split(path.sep), rsplit = rhs.split(path.sep);

    if (lsplit.length < rsplit.length || (lsplit.length === rsplit.length && lhs < rhs)) {
        return -1;
    }

    if (lsplit.length > rsplit.length || (lsplit.length === rsplit.length && lhs > rhs)) {
        return 1;
    }

    return 0;
}

function getAdjacencyMatrixValue (reports, x, y) {
    if (x === y) {
        return 0;
    }

    if (doesDependencyExist(reports[x], reports[y])) {
        return 1;
    }

    return 0;
}

function doesDependencyExist (from, to) {
    return from.dependencies.reduce(function (result, dependency) {
        if (result === false) {
            return checkDependency(from.path, dependency, to.path);
        }

        return true;
    }, false);
}

function checkDependency (from, dependency, to) {
    if (isCommonJSDependency(dependency)) {
        if (isInternalCommonJSDependency(dependency)) {
            return isDependency(from, dependency, to);
        }

        return false;
    }

    return isDependency(from, dependency, to);
}

function isCommonJSDependency (dependency) {
    return dependency.type === 'CommonJS';
}

function isInternalCommonJSDependency (dependency) {
    return dependency.path[0] === '.' &&
           (
               dependency.path[1] === path.sep ||
               (
                   dependency.path[1] === '.' &&
                   dependency.path[2] === path.sep
               )
           );
}

function isDependency (from, dependency, to) {
    var dependencyPath = dependency.path;

    if (path.extname(dependencyPath) === '') {
        dependencyPath += path.extname(to);
    }

    return path.resolve(path.dirname(from), dependencyPath) === to;
}

function percentifyDensity (density, matrix) {
    return percentify(density, matrix.length * matrix.length);
}

function percentify (value, limit) {
    if (limit === 0) {
        return 0;
    }

    return (value / limit) * 100;
}

function createVisibilityMatrix (result) {
    var product = result.adjacencyMatrix, sum = result.adjacencyMatrix, changeCost = 0, visibilityMatrix;

    result.adjacencyMatrix.forEach(function () {
        product = matrix.multiply(product, result.adjacencyMatrix);
        sum = matrix.add(product, sum);
    });

    result.adjacencyMatrix.forEach(function (ignore, index) {
        sum[index][index] = 1;
    });

    visibilityMatrix = sum.map(function (row, rowIndex) {
        return row.map(function (value, columnIndex) {
            if (value > 0) {
                changeCost += 1;

                if (columnIndex !== rowIndex) {
                    return 1;
                }
            }

            return 0;
        });
    });

    result.visibilityMatrix = visibilityMatrix;
    result.changeCost = percentifyDensity(changeCost, visibilityMatrix);
}

function setCoreSize (result) {
    var fanIn, fanOut, boundaries, coreSize;

    if (result.firstOrderDensity === 0) {
        result.coreSize = 0;
        return;
    }

    fanIn = new Array(result.visibilityMatrix.length);
    fanOut = new Array(result.visibilityMatrix.length);
    boundaries = {};
    coreSize = 0;

    result.visibilityMatrix.forEach(function (row, rowIndex) {
        fanIn[rowIndex] = row.reduce(function (sum, value, valueIndex) {
            if (rowIndex === 0) {
                fanOut[valueIndex] = value;
            } else {
                fanOut[valueIndex] += value;
            }

            return sum + value;
        }, 0);
    });

    // Boundary values can also be chosen by looking for discontinuity in the
    // distribution of values, but I've chosen the median to keep it simple.
    boundaries.fanIn = getMedian(fanIn.slice());
    boundaries.fanOut = getMedian(fanOut.slice());

    result.visibilityMatrix.forEach(function (ignore, index) {
        if (fanIn[index] >= boundaries.fanIn && fanOut[index] >= boundaries.fanOut) {
            coreSize += 1;
        }
    });

    result.coreSize = percentify(coreSize, result.visibilityMatrix.length);
}

function getMedian (values) {
    values.sort(compareNumbers);

    if (check.odd(values.length)) {
        return values[(values.length - 1) / 2];
    }

    return (values[(values.length - 2) / 2] + values[values.length / 2]) / 2;
}

function compareNumbers (lhs, rhs) {
    if (lhs < rhs) {
        return -1;
    }

    if (lhs > rhs) {
        return 1;
    }

    return 0;
}

