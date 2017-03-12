'use strict'

const _isString = require('lodash.isstring')
const assert = require('assert')
const path = require('path')
const moduleAnalyser = require('./module')

exports.analyse = analyse
exports.processResults = processResults

function analyse (modules, walker, options) {
  // TODO: Asynchronize.
  options = options || {}
  assert(Array.isArray(modules), 'Invalid modules')

  const reports = modules.map(m => {
    var report
    assert(_isString(m.path) && m.path.length > 0, 'Invalid path')
    try {
      report = moduleAnalyser.analyse(m.ast, walker, options)
      report.path = m.path
      return report
    } catch (error) {
      // These error messages are useless unless they contain the module path.
      error.message = m.path + ': ' + error.message
      throw error
    }
  }, [])
  if (options.skipCalculation) {
    return {reports}
  }
  return processResults({reports}, options.noCoreSize)
}

function processResults (result, noCoreSize) {
  createAdjacencyMatrix(result)
  if (!noCoreSize) {
    createVisibilityMatrix(result)
    setCoreSize(result)
  }
  calculateAverages(result)
  return result
}

function createAdjacencyMatrix (result) {
  const adjacencyMatrix = new Array(result.reports.length)
  let density = 0
  result.reports
    .sort((lhs, rhs) => comparePaths(lhs.path, rhs.path))
    .forEach((ignore, x) => {
      adjacencyMatrix[x] = new Array(result.reports.length)
      result.reports.forEach((ignore, y) => {
        adjacencyMatrix[x][y] = getAdjacencyMatrixValue(result.reports, x, y)
        if (adjacencyMatrix[x][y] === 1) {
          density += 1
        }
      })
    })
  result.adjacencyMatrix = adjacencyMatrix
  result.firstOrderDensity = percentifyDensity(density, adjacencyMatrix)
}

function comparePaths (lhs, rhs) {
  const lsplit = lhs.split(path.sep)
  const rsplit = rhs.split(path.sep)
  if (lsplit.length < rsplit.length || (lsplit.length === rsplit.length && lhs < rhs)) {
    return -1
  }
  if (lsplit.length > rsplit.length || (lsplit.length === rsplit.length && lhs > rhs)) {
    return 1
  }
  return 0
}

function getAdjacencyMatrixValue (reports, x, y) {
  if (x === y) {
    return 0
  }
  if (doesDependencyExist(reports[x], reports[y])) {
    return 1
  }
  return 0
}

function doesDependencyExist (from, to) {
  return from.dependencies.reduce((result, dependency) => {
    if (result === false) {
      return checkDependency(from.path, dependency, to.path)
    }
    return true
  }, false)
}

function checkDependency (from, dependency, to) {
  if (isCommonJSDependency(dependency)) {
    if (isInternalCommonJSDependency(dependency)) {
      return isDependency(from, dependency, to)
    }
    return false
  }
  return isDependency(from, dependency, to)
}

const percentify = (value, limit) => limit === 0 ? 0 : (value / limit) * 100
const percentifyDensity = (density, matrix) => percentify(density, matrix.length * matrix.length)

const isCommonJSDependency = dependency => dependency.type === 'CommonJS'
const isInternalCommonJSDependency = dependency => (
  dependency.path[0] === '.' &&
  (
    dependency.path[1] === path.sep ||
    (dependency.path[1] === '.' && dependency.path[2] === path.sep)
  )
)

function isDependency (from, dependency, to) {
  const dependencyPath = dependency.path
  const fromFileAbsolutePath = path.resolve(from)
  const toFileAbsolutePath = path.resolve(to)
  let dependencyAbsolutePath = path.resolve(path.dirname(fromFileAbsolutePath), dependencyPath)
  if (path.extname(dependencyPath) === '') {
    const index = path.join(dependencyAbsolutePath, 'index.js')
    if (index === toFileAbsolutePath) {
      return true
    } else {
      dependencyAbsolutePath += path.extname(to)
    }
  }
  return dependencyAbsolutePath === toFileAbsolutePath
}

// Implementation of floydWarshall alg for calculating visibility matrix in O(n^3) instead of O(n^4) with successive raising of powers

function createVisibilityMatrix (result) {
  var changeCost = 0
  const distMatrix = adjacencyToDistMatrix(result.adjacencyMatrix)
  const matrixLen = distMatrix.length
  for (let k = 0; k < matrixLen; k += 1) {
    for (let i = 0; i < matrixLen; i += 1) {
      for (let j = 0; j < matrixLen; j += 1) {
        if (distMatrix[i][j] > distMatrix[i][k] + distMatrix[k][j]) {
          distMatrix[i][j] = distMatrix[i][k] + distMatrix[k][j]
        }
      }
    }
  }

  // Convert back from a distance matrix to adjacency matrix, while also calculating change cost
  const visibilityMatrix = distMatrix.map(
    (row, rowIndex) => row.map(
      (value, columnIndex) => {
        if (value < Infinity) {
          changeCost += 1
          if (columnIndex !== rowIndex) {
            return 1
          }
        }
        return 0
      }
    )
  )
  result.visibilityMatrix = visibilityMatrix
  result.changeCost = percentifyDensity(changeCost, visibilityMatrix)
}

function adjacencyToDistMatrix (matrix) {
  const distMatrix = []
  for (let i = 0; i < matrix.length; i += 1) {
    distMatrix.push([])
    for (let j = 0; j < matrix[i].length; j += 1) {
      let value = null
      if (i === j) {
        value = 1
      } else {
        // Where we have 0, set distance to Infinity
        value = matrix[i][j] || Infinity
      }
      distMatrix[i][j] = value
    }
  }
  return distMatrix
}

function setCoreSize (result) {
  if (result.firstOrderDensity === 0) {
    result.coreSize = 0
    return
  }
  const fanIn = new Array(result.visibilityMatrix.length)
  const fanOut = new Array(result.visibilityMatrix.length)
  const boundaries = {}
  let coreSize = 0
  result.visibilityMatrix.forEach((row, rowIndex) => {
    fanIn[rowIndex] = row.reduce((sum, value, valueIndex) => {
      if (rowIndex === 0) {
        fanOut[valueIndex] = value
      } else {
        fanOut[valueIndex] += value
      }
      return sum + value
    }, 0)
  })

  // Boundary values can also be chosen by looking for discontinuity in the
  // Distribution of values, but I've chosen the median to keep it simple.
  boundaries.fanIn = getMedian(fanIn.slice())
  boundaries.fanOut = getMedian(fanOut.slice())
  result.visibilityMatrix.forEach((ignore, index) => {
    if (fanIn[index] >= boundaries.fanIn && fanOut[index] >= boundaries.fanOut) {
      coreSize += 1
    }
  })
  result.coreSize = percentify(coreSize, result.visibilityMatrix.length)
}

function getMedian (values) {
  values.sort(compareNumbers)
  if (values.length % 2 === 1) {
    return values[(values.length - 1) / 2]
  }
  return (values[(values.length - 2) / 2] + values[values.length / 2]) / 2
}

function compareNumbers (lhs, rhs) {
  if (lhs < rhs) {
    return -1
  }
  if (lhs > rhs) {
    return 1
  }
  return 0
}

function calculateAverages (result) {
  var divisor
  const sums = {
    cyclomatic: 0,
    effort: 0,
    loc: 0,
    maintainability: 0,
    params: 0
  }
  if (result.reports.length === 0) {
    divisor = 1
  } else {
    divisor = result.reports.length
  }
  result.reports.forEach(
    report => Object.keys(sums).forEach(
      key => { sums[key] += report[key] }
    )
  )
  Object.keys(sums).forEach(key => { result[key] = sums[key] / divisor })
}
