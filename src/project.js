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
    var adjacencyMatrix = createAdjacencyMatrix(reports);

    return {
        adjacency: adjacencyMatrix,
        visibility: createVisibilityMatrix(adjacencyMatrix.matrix)
    };
}

// TODO: Move this dependency stuff into a separate module
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
        //return 0;
        // Requires compensation when setting density
        // TODO: Reinstate to 0, implement summing of matrix powers until transitive closue (drop matrix-utilities), revert density calculation
        return 1;
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
        //density = density / (matrix.length * (matrix.length - 1));
        // Compensation for diagonal 1s in matrix
        density = (density - matrix.length) / (matrix.length * (matrix.length - 1));
    }

    return {
        density: density,
        matrix: matrix
    };
}

function createVisibilityMatrix (adjacencyMatrix) {
    var visibilityMatrix = adjacencyMatrix, density = 0;

    (adjacencyMatrix.length - 1).times(function () {
        visibilityMatrix = matrix.multiply(visibilityMatrix, adjacencyMatrix);
    });

    visibilityMatrix = visibilityMatrix.map(function (row) {
        return row.map(function (value) {
            if (value > 0) {
                density += 1;
                return 1;
            }

            return 0;
        });
    });

    return wrapMatrix(density, visibilityMatrix);
}

Number.prototype.times = function (fn) {
    var i;

    for (i = 0; i < this; i += 1) {
        fn(i);
    }
}

