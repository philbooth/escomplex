'use strict'
var assert = require('chai').assert
var sinon = require('sinon')
var parsers = require('./helpers/parsers')
var walker = require('../src/walker')

// List of test cases taken directly from the ESTree
// Spec (https://github.com/estree/estree)
parsers.forEach(function (parserName, parser, options) {
  suite('AST Walker', function () {
    setup(function () {
      this.callbacks = {
        createScope: sinon.stub(),
        popScope: sinon.stub(),
        processNode: sinon.stub()
      }
      this.walk = function parse (code) {
        var tree = parser.parse(code, options)
        walker.walk(tree, {}, this.callbacks)
      }
    })
    suite('Statements', function () {
      test('debugger statement', function () {
        this.walk('debugger;')
        assert.strictEqual(this.callbacks.processNode.callCount, 1)
      })
      test('empty statement', function () {
        this.walk(';')
        assert.strictEqual(this.callbacks.processNode.callCount, 1)
      })
      test('empty block statement', function () {
        this.walk('{}')
        var blockNode = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(blockNode.type, 'BlockStatement')
        assert.strictEqual(blockNode.body.length, 0)
        assert.strictEqual(this.callbacks.createScope.callCount, 0)
        assert.strictEqual(this.callbacks.popScope.callCount, 0)
      })
      test('expression statement', function () {
        this.walk('a')
        var statement = this.callbacks.processNode.firstCall.args[0]
        var expression = this.callbacks.processNode.secondCall.args[0]
        assert.strictEqual(statement.type, 'ExpressionStatement')
        assert.strictEqual(statement.expression, expression)
        assert.strictEqual(this.callbacks.createScope.callCount, 0)
        assert.strictEqual(this.callbacks.popScope.callCount, 0)
      })
      test('if statement', function () {
        this.walk('if (true) { true; } else { false; }')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'IfStatement')
        assert.strictEqual(statement.test.type, 'Literal')
        assert.strictEqual(statement.test.value, true)
        assert.strictEqual(statement.consequent.body[0].expression.value, true)
        assert.strictEqual(statement.alternate.body[0].expression.value, false)
      })
      test('labeled statement', function () {
        this.walk('foo: a;')
        assert.strictEqual(this.callbacks.processNode.callCount, 1)
      })
      test('break statement (with label)', function () {
        this.walk('foo: break foo')
        var statement = this.callbacks.processNode.firstCall.args[0].body
        assert.strictEqual(statement.type, 'BreakStatement')
        assert.strictEqual(statement.label.type, 'Identifier')
      })
      test('continue statement', function () {
        this.walk('while (true) { continue }')
        var statement = this.callbacks.processNode.firstCall.args[0].body.body[0]
        assert.strictEqual(statement.type, 'ContinueStatement')
        assert.strictEqual(statement.label, null)
      })
      test('with statement', function () {
        this.walk('with (foo) {}')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'WithStatement')
        assert.strictEqual(statement.object.type, 'Identifier')
        assert.strictEqual(statement.body.type, 'BlockStatement')
      })
      test('switch statement', function () {
        this.walk('switch (foo) {}')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'SwitchStatement')
        assert.strictEqual(statement.discriminant.type, 'Identifier')
        assert.strictEqual(statement.cases.length, 0)
      })
      test('return statement', function () {
        this.walk('function foo() { return 1 }')
        var statement = this.callbacks.processNode.firstCall.args[0].body.body[0]
        assert.strictEqual(statement.type, 'ReturnStatement')
        assert.strictEqual(statement.argument.type, 'Literal')
        assert.strictEqual(statement.argument.value, 1)
      })
      test('throw statement', function () {
        this.walk('function foo() { throw "foo" }')
        var statement = this.callbacks.processNode.firstCall.args[0].body.body[0]
        assert.strictEqual(statement.type, 'ThrowStatement')
        assert.strictEqual(statement.argument.type, 'Literal')
      })
      test('try statement', function () {
        this.walk('try {} finally {}')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'TryStatement')
        assert.strictEqual(statement.block.type, 'BlockStatement')
        assert.strictEqual(statement.handler, null)
        assert.strictEqual(statement.finalizer.type, 'BlockStatement')
      })
      test('while statement', function () {
        this.walk('while (true) {}')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'WhileStatement')
        assert.strictEqual(statement.test.type, 'Literal')
        assert.strictEqual(statement.body.type, 'BlockStatement')
      })
      test('do-while statement', function () {
        this.walk('do {} while (true)')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'DoWhileStatement')
        assert.strictEqual(statement.body.type, 'BlockStatement')
        assert.strictEqual(statement.test.type, 'Literal')
      })
      test('for statement', function () {
        this.walk('for (var i = 0; i < 10; i++) {}')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'ForStatement')
        assert.strictEqual(statement.init.type, 'VariableDeclaration')
        assert.strictEqual(statement.test.type, 'BinaryExpression')
        assert.strictEqual(statement.update.type, 'UpdateExpression')
        assert.strictEqual(statement.body.type, 'BlockStatement')
      })
      test('for-in statement', function () {
        this.walk('for (var o in foo) {}')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'ForInStatement')
        assert.strictEqual(statement.left.type, 'VariableDeclaration')
        assert.strictEqual(statement.right.type, 'Identifier')
        assert.strictEqual(statement.body.type, 'BlockStatement')
      })
    })
    suite('Declarations', function () {
      test('function declaration', function () {
        this.walk('function foo() {}')
        var declaration = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(declaration.type, 'FunctionDeclaration')
        assert.strictEqual(declaration.id.name, 'foo')
        assert.strictEqual(declaration.id.type, 'Identifier')
        assert.strictEqual(declaration.params.length, 0)
        assert.strictEqual(declaration.body.type, 'BlockStatement')
        assert.strictEqual(declaration.body.body.length, 0)
      })
      test('generator function declaration', function () {
        this.walk('function* foo() {}')
        var declaration = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(declaration.type, 'FunctionDeclaration')
        assert.strictEqual(declaration.id.name, 'foo')
        assert.strictEqual(declaration.id.type, 'Identifier')
        assert.strictEqual(declaration.generator, true)
        assert.strictEqual(declaration.params.length, 0)
        assert.strictEqual(declaration.body.type, 'BlockStatement')
        assert.strictEqual(declaration.body.body.length, 0)
      })
      test('var declaration', function () {
        this.walk('var a = 1')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'VariableDeclaration')
        assert.strictEqual(statement.kind, 'var')
        assert.strictEqual(statement.declarations.length, 1)
      })
      test('let declaration', function () {
        this.walk('let a = 1')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'VariableDeclaration')
        assert.strictEqual(statement.kind, 'let')
        assert.strictEqual(statement.declarations.length, 1)
      })
      test('const declaration', function () {
        this.walk('const a = 1')
        var statement = this.callbacks.processNode.firstCall.args[0]
        assert.strictEqual(statement.type, 'VariableDeclaration')
        assert.strictEqual(statement.kind, 'const')
        assert.strictEqual(statement.declarations.length, 1)
      })
      test('var declarator', function () {
        this.walk('var a = 1')
        var statement = this.callbacks.processNode.firstCall.args[0]
        var declarator = this.callbacks.processNode.secondCall.args[0]
        assert.strictEqual(statement.declarations[0], declarator)
        assert.strictEqual(declarator.id.type, 'Identifier')
        assert.strictEqual(declarator.id.name, 'a')
      })
      test('let declarator', function () {
        this.walk('let a = 1')
        var statement = this.callbacks.processNode.firstCall.args[0]
        var declarator = this.callbacks.processNode.secondCall.args[0]
        assert.strictEqual(statement.declarations[0], declarator)
        assert.strictEqual(declarator.id.type, 'Identifier')
        assert.strictEqual(declarator.id.name, 'a')
      })
      test('const declarator', function () {
        this.walk('const a = 1')
        var statement = this.callbacks.processNode.firstCall.args[0]
        var declarator = this.callbacks.processNode.secondCall.args[0]
        assert.strictEqual(statement.declarations[0], declarator)
        assert.strictEqual(declarator.id.type, 'Identifier')
        assert.strictEqual(declarator.id.name, 'a')
      })
    })

    /* Expressions */
    suite('Expressions', function () {
      test('this expression', function () {
        this.walk('this')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'ThisExpression')
      })
      test('empty array expression', function () {
        this.walk('[]')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'ArrayExpression')
        assert.strictEqual(expression.elements.length, 0)
      })
      test('array expression', function () {
        this.walk('[ 1, 2 ]')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'ArrayExpression')
        assert.strictEqual(expression.elements.length, 2)
        assert.strictEqual(expression.elements[0].value, 1)
        assert.strictEqual(expression.elements[1].value, 2)
      })
      test('object expression', function () {
        this.walk('({})')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'ObjectExpression')
        assert.strictEqual(expression.properties.length, 0)
      })
      test('object expression with properties', function () {
        this.walk('({ a: "foo", "bar": "baz" })')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'ObjectExpression')
        assert.strictEqual(expression.properties.length, 2)
        assert.strictEqual(expression.properties[0].type, 'Property')
        assert.strictEqual(expression.properties[0].key.type, 'Identifier')
        assert.strictEqual(expression.properties[0].key.name, 'a')
        assert.strictEqual(expression.properties[0].value.type, 'Literal')
        assert.strictEqual(expression.properties[0].value.value, 'foo')
        assert.strictEqual(expression.properties[1].type, 'Property')
        assert.strictEqual(expression.properties[1].key.type, 'Literal')
        assert.strictEqual(expression.properties[1].key.value, 'bar')
        assert.strictEqual(expression.properties[1].value.type, 'Literal')
        assert.strictEqual(expression.properties[1].value.value, 'baz')
      })
      test('function expression', function () {
        this.walk('(function foo() {})')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'FunctionExpression')
        assert.strictEqual(expression.id.name, 'foo')
        assert.strictEqual(expression.generator, false)
      })
      test('generator function expression', function () {
        this.walk('(function* foo() {})')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'FunctionExpression')
        assert.strictEqual(expression.id.name, 'foo')
        assert.strictEqual(expression.generator, true)
      })
      test('sequence expression', function () {
        this.walk('"a","b"')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'SequenceExpression')
        assert.strictEqual(expression.expressions.length, 2)
      })
      test('unary expression', function () {
        this.walk('!true')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'UnaryExpression')
        assert.strictEqual(expression.operator, '!')
        assert.strictEqual(expression.prefix, true)
        assert.strictEqual(expression.argument.type, 'Literal')
      })
      test('binary expression', function () {
        this.walk('1 + 1')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'BinaryExpression')
        assert.strictEqual(expression.operator, '+')
        assert.strictEqual(expression.left.type, 'Literal')
        assert.strictEqual(expression.right.type, 'Literal')
      })
      test('assignment expression', function () {
        this.walk('a = 1')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'AssignmentExpression')
        assert.strictEqual(expression.operator, '=')
        assert.strictEqual(expression.left.type, 'Identifier')
        assert.strictEqual(expression.right.type, 'Literal')
      })
      test('update expression', function () {
        this.walk('a++')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'UpdateExpression')
        assert.strictEqual(expression.operator, '++')
        assert.strictEqual(expression.argument.type, 'Identifier')
        assert.strictEqual(expression.prefix, false)
      })
      test('logical expression: &&', function () {
        this.walk('1 && 1')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'LogicalExpression')
        assert.strictEqual(expression.operator, '&&')
      })
      test('logical expression: ||', function () {
        this.walk('1 || 1')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'LogicalExpression')
        assert.strictEqual(expression.operator, '||')
      })
      test('conditional expression', function () {
        this.walk('true ? 1 : 0')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'ConditionalExpression')
        assert.strictEqual(expression.test.type, 'Literal')
        assert.strictEqual(expression.test.value, true)
        assert.strictEqual(expression.alternate.type, 'Literal')
        assert.strictEqual(expression.alternate.value, 0)
        assert.strictEqual(expression.consequent.type, 'Literal')
        assert.strictEqual(expression.consequent.value, 1)
      })
      test('call expression', function () {
        this.walk('foo("bar")')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'CallExpression')
        assert.strictEqual(expression.callee.type, 'Identifier')
        assert.strictEqual(expression.arguments.length, 1)
        assert.strictEqual(expression.arguments[0].type, 'Literal')
      })
      test('new expression', function () {
        this.walk('new Foo("bar")')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'NewExpression')
        assert.strictEqual(expression.callee.type, 'Identifier')
        assert.strictEqual(expression.arguments.length, 1)
        assert.strictEqual(expression.arguments[0].type, 'Literal')
      })
      test('member expression (computed)', function () {
        this.walk('foo["bar"]')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'MemberExpression')
        assert.strictEqual(expression.object.type, 'Identifier')
        assert.strictEqual(expression.property.type, 'Literal')
        assert.strictEqual(expression.computed, true)
      })
      test('member expression (non-computed)', function () {
        this.walk('foo.bar')
        var expression = this.callbacks.processNode.firstCall.args[0].expression
        assert.strictEqual(expression.type, 'MemberExpression')
        assert.strictEqual(expression.object.type, 'Identifier')
        assert.strictEqual(expression.property.type, 'Identifier')
        assert.strictEqual(expression.computed, false)
      })
    })
    suite('Clauses', function () {
      test('switchcase', function () {
        this.walk('switch (1) { case foo: "bar"; default: "baz" }')
        var cases = this.callbacks.processNode.args[0][0].cases
        assert.strictEqual(cases.length, 2)
        assert.strictEqual(cases[0].type, 'SwitchCase')
        assert.strictEqual(cases[0].test.type, 'Identifier')
        assert.strictEqual(cases[1].type, 'SwitchCase')
        assert.strictEqual(cases[1].test, null)
      })
      test('catch clause', function () {
        this.walk('try {} catch (foo) {}')
        var clause = this.callbacks.processNode.args[0][0].handler
        assert.strictEqual(clause.type, 'CatchClause')
        assert.strictEqual(clause.param.type, 'Identifier')
        assert.strictEqual(clause.body.type, 'BlockStatement')
        assert.strictEqual(clause.body.body.length, 0)
      })
    })
    suite('Miscellaneous', function () {
      test('identifier', function () {
        this.walk('foo')
        var expression = this.callbacks.processNode.args[0][0].expression
        assert.strictEqual(expression.type, 'Identifier')
        assert.strictEqual(expression.name, 'foo')
      })
      test('literal', function () {
        this.walk('1')
        var expression = this.callbacks.processNode.args[0][0].expression
        assert.strictEqual(expression.type, 'Literal')
        assert.strictEqual(expression.value, 1)
      })
      test('regexp literal', function () {
        this.walk('/foo/i')
        var expression = this.callbacks.processNode.args[0][0].expression
        assert.strictEqual(expression.type, 'Literal')
        assert.strictEqual(expression.regex.pattern, 'foo')
        assert.strictEqual(expression.regex.flags, 'i')
      })
    })
  })
})
