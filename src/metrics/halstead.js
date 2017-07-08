'use strict'

module.exports = HalsteadMetrics

function HalsteadMetrics () {
  this.operands = {
    distinct: 0,
    identifiers: [],
    total: 0
  }
  this.operators = {
    distinct: 0,
    identifiers: [],
    total: 0
  }
  this.reset()
}

HalsteadMetrics.prototype.reset = function () {
  this.vocabulary = 0
  this.difficulty = 0
  this.volume = 0
  this.effort = 0
  this.bugs = 0
  this.time = 0
}

HalsteadMetrics.prototype.calculate = function () {
  this.length = this.operators.total + this.operands.total
  if (this.length === 0) {
    this.reset()
  } else {
    this.vocabulary = this.operators.distinct + this.operands.distinct
    this.difficulty = (this.operators.distinct / 2) * (this.operands.distinct === 0 ? 1 : this.operands.total / this.operands.distinct)
    this.volume = this.length * (Math.log(this.vocabulary) / Math.log(2))
    this.effort = this.difficulty * this.volume
    this.bugs = this.volume / 3000
    this.time = this.effort / 18
  }
}
