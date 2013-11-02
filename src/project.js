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

    var reports;

    check.verifyArray(modules, 'Invalid modules');

    reports = modules.map(function (m) {
        var report;

        check.verifyUnemptyString(m.path, 'Invalid path');

        report = moduleAnalyser.analyse(m.ast, walker, options);
        report.path = m.path;

        return report;
    }, []);

    return {
        reports: reports,
        matrices: createMatrices(reports)
    };
}

function createMatrices (reports) {
    // For discussion of these metrics, see http://www.people.hbs.edu/cbaldwin/DR2/MRBDesignStructure17thSep1.pdf
    var adjacencyMatrix = createAdjacencyMatrix(reports);

    return {
        adjacency: adjacencyMatrix,
        visibility: createVisibilityMatrix(adjacencyMatrix.matrix)
    };
}

function createAdjacencyMatrix (reports) {
    var adjacencyMatrix = new Array(reports.length), density = 0;

    reports.sort(function (lhs, rhs) {
        return comparePaths(lhs.path, rhs.path);
    }).forEach(function (ignore, x) {
        adjacencyMatrix[x] = new Array(reports.length);
        reports.forEach(function (ignore, y) {
            adjacencyMatrix[x][y] = getAdjacencyMatrixValue(reports, x, y);
            if (adjacencyMatrix[x][y] === 1) {
                density += 1;
            }
        });
    });

    return wrapMatrix(density, adjacencyMatrix);
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

function wrapMatrix (density, matrix) {
    if (density > 0) {
        density = density / (matrix.length * matrix.length);
    }

    return {
        density: density,
        matrix: matrix
    };
}

function createVisibilityMatrix (adjacencyMatrix) {
    var product = adjacencyMatrix, sum = adjacencyMatrix, density = 0, visibilityMatrix;

    adjacencyMatrix.forEach(function () {
        product = matrix.multiply(product, adjacencyMatrix);
        sum = matrix.add(product, sum);
    });

    // HACK: I'm explicitly not summing the self-reference diagonal here,
    //       since that punishes single-module projects by giving them a
    //       change cost of 100%. A case could be made that is ok, but it
    //       feels wrong to me.
    visibilityMatrix = sum.map(function (row) {
        return row.map(function (value) {
            if (value > 0) {
                density += 1;
                return 1;
            }

            return 0;
        });
    });

    visibilityMatrix = wrapMatrix(density, visibilityMatrix);
    visibilityMatrix.coreSize = getCoreSize(visibilityMatrix);

    return visibilityMatrix;
}

function getCoreSize (visibility) {
    var fanIn, fanOut, boundaries, coreSize;

    if (visibility.density === 0) {
        return 0;
    }

    fanIn = new Array(visibility.matrix.length);
    fanOut = new Array(visibility.matrix.length),
    boundaries = {};
    coreSize = 0;

    visibility.matrix.forEach(function (row, rowIndex) {
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

    visibility.matrix.forEach(function (ignore, index) {
        if (fanIn[index] >= boundaries.fanIn && fanOut[index] >= boundaries.fanOut) {
            coreSize += 1;
        }
    });

    return coreSize / visibility.matrix.length;
}

function getMedian (values) {
    values.sort(compareNumbers);

    if (check.isOddNumber(values.length)) {
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

