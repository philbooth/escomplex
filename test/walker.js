'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var parsers = require('./helpers/parsers');
var walker = require('../src/walker');

// List of test cases taken directly from the ESTree
// spec (https://github.com/estree/estree)
parsers.forEach(function (parserName, parser, options) {
    suite('AST Walker', function () {

        setup(function () {
            this.callbacks = {
                processNode: sinon.stub(),
                createScope: sinon.stub(),
                popScope: sinon.stub()
            };

            this.walk = function parse (code) {
                var tree = parser.parse(code, options);
                walker.walk(tree, {}, this.callbacks);
            };
        });


        suite('Unsupported Syntax', function () {
            test('empty statement', function () {
                this.walk(';');
                assert.strictEqual(this.callbacks.processNode.callCount, 0);
            });

            test('labeled statement', function () {
                this.walk('foo: a;');
                assert.strictEqual(this.callbacks.processNode.callCount, 0);
            });
        });


        suite('Statements', function () {
            test('empty block statement', function () {
                this.walk('{}');

                var blockNode = this.callbacks.processNode.firstCall.args[0];
                assert.strictEqual(blockNode.type, 'BlockStatement');
                assert.strictEqual(blockNode.body.length, 0);

                assert.strictEqual(this.callbacks.createScope.callCount, 0);
                assert.strictEqual(this.callbacks.popScope.callCount, 0);
            });

            test('expression statement', function () {
                this.walk('a');

                var statement = this.callbacks.processNode.firstCall.args[0];
                var expression = this.callbacks.processNode.secondCall.args[0];
                assert.strictEqual(statement.type, 'ExpressionStatement');
                assert.strictEqual(statement.expression, expression);
                assert.strictEqual(this.callbacks.createScope.callCount, 0);
                assert.strictEqual(this.callbacks.popScope.callCount, 0);
            });

            test('if statement', function () {
                this.walk('if (true) { true; } else { false; }');

                var statement = this.callbacks.processNode.firstCall.args[0];
                assert.strictEqual(statement.type, 'IfStatement');
                assert.strictEqual(statement.test.type, 'Literal');
                assert.strictEqual(statement.test.value, true);
                assert.strictEqual(statement.consequent.body[0].expression.value, true);
                assert.strictEqual(statement.alternate.body[0].expression.value, false);
            });


            test('break statement');
            test('continue statement');
            test('with statement');
            test('switch statement');
            test('return statement');
            test('throw statement');
            test('try statement');
            test('while statement');
            test('do-while statement');
            test('for statement');
            test('for-in statement');
            test('for-of statement');
            test('debugger statement');
        });


        suite('Declarations', function () {
            test('function declaration', function () {
                this.walk('function foo() {}');

                var declaration = this.callbacks.processNode.firstCall.args[0];
                assert.strictEqual(declaration.type, 'FunctionDeclaration');
                assert.strictEqual(declaration.id.name, 'foo');
                assert.strictEqual(declaration.id.type, 'Identifier');
                assert.strictEqual(declaration.params.length, 0);
                assert.strictEqual(declaration.body.type, 'BlockStatement');
                assert.strictEqual(declaration.body.body.length, 0);
            });

            test('generator function declaration', function () {
                this.walk('function* foo() {}');

                var declaration = this.callbacks.processNode.firstCall.args[0];
                assert.strictEqual(declaration.type, 'FunctionDeclaration');
                assert.strictEqual(declaration.id.name, 'foo');
                assert.strictEqual(declaration.id.type, 'Identifier');
                assert.strictEqual(declaration.generator, true);
                assert.strictEqual(declaration.params.length, 0);
                assert.strictEqual(declaration.body.type, 'BlockStatement');
                assert.strictEqual(declaration.body.body.length, 0);
            });

            test('var declaration', function () {
                this.walk('var a = 1');

                var statement = this.callbacks.processNode.firstCall.args[0];
                assert.strictEqual(statement.type, 'VariableDeclaration');
                assert.strictEqual(statement.kind, 'var');
                assert.strictEqual(statement.declarations.length, 1);
            });

            test('let declaration', function () {
                this.walk('let a = 1');

                var statement = this.callbacks.processNode.firstCall.args[0];
                assert.strictEqual(statement.type, 'VariableDeclaration');
                assert.strictEqual(statement.kind, 'let');
                assert.strictEqual(statement.declarations.length, 1);
            });

            test('const declaration', function () {
                this.walk('const a = 1');

                var statement = this.callbacks.processNode.firstCall.args[0];
                assert.strictEqual(statement.type, 'VariableDeclaration');
                assert.strictEqual(statement.kind, 'const');
                assert.strictEqual(statement.declarations.length, 1);
            });

            test('var declarator', function () {
                this.walk('var a = 1');

                var statement = this.callbacks.processNode.firstCall.args[0];
                var declarator = this.callbacks.processNode.secondCall.args[0];
                assert.strictEqual(statement.declarations[0], declarator);
                assert.strictEqual(declarator.id.type, 'Identifier');
                assert.strictEqual(declarator.id.name, 'a');
            });

            test('let declarator', function () {
                this.walk('let a = 1');

                var statement = this.callbacks.processNode.firstCall.args[0];
                var declarator = this.callbacks.processNode.secondCall.args[0];
                assert.strictEqual(statement.declarations[0], declarator);
                assert.strictEqual(declarator.id.type, 'Identifier');
                assert.strictEqual(declarator.id.name, 'a');
            });

            test('const declarator', function () {
                this.walk('const a = 1');

                var statement = this.callbacks.processNode.firstCall.args[0];
                var declarator = this.callbacks.processNode.secondCall.args[0];
                assert.strictEqual(statement.declarations[0], declarator);
                assert.strictEqual(declarator.id.type, 'Identifier');
                assert.strictEqual(declarator.id.name, 'a');
            });
        });

        /* Expressions */
        suite('Expressions', function () {
            test('this expression', function () {
                this.walk('this');

                var expression = this.callbacks.processNode.firstCall.args[0].expression;
                assert.strictEqual(expression.type, 'ThisExpression');
            });

            test('empty array expression', function () {
                this.walk('[]');
                var expression = this.callbacks.processNode.firstCall.args[0].expression;
                assert.strictEqual(expression.type, 'ArrayExpression');
                assert.strictEqual(expression.elements.length, 0);
            });

            test('array expression', function () {
                this.walk('[ 1, 2 ]');
                var expression = this.callbacks.processNode.firstCall.args[0].expression;
                assert.strictEqual(expression.type, 'ArrayExpression');
                assert.strictEqual(expression.elements.length, 2);
                assert.strictEqual(expression.elements[0].value, 1);
                assert.strictEqual(expression.elements[1].value, 2);
            });

            test('object expression');
            test('property expression');

            test('function expression', function () {
                this.walk('(function foo() {})');
                var expression = this.callbacks.processNode.firstCall.args[0].expression;
                assert.strictEqual(expression.type, 'FunctionExpression');
                assert.strictEqual(expression.id.name, 'foo');
                assert.strictEqual(expression.generator, false);
            });

            test('generator function expression', function () {
                this.walk('(function* foo() {})');
                var expression = this.callbacks.processNode.firstCall.args[0].expression;
                assert.strictEqual(expression.type, 'FunctionExpression');
                assert.strictEqual(expression.id.name, 'foo');
                assert.strictEqual(expression.generator, true);
            });

            test('sequence expression');
            test('unary expression');
            test('binary expression');
            test('assignment expression');
            test('update expression');

            test('logical expression: &&', function () {
                this.walk('1 && 1');
                var expression = this.callbacks.processNode.firstCall.args[0].expression;
                assert.strictEqual(expression.type, 'LogicalExpression');
                assert.strictEqual(expression.operator, '&&');
            });

            test('logical expression: ||', function () {
                this.walk('1 || 1');
                var expression = this.callbacks.processNode.firstCall.args[0].expression;
                assert.strictEqual(expression.type, 'LogicalExpression');
                assert.strictEqual(expression.operator, '||');
            });

            test('conditional expression');
            test('call expression');
            test('new expression');
            test('member expression');
            test('super expression');
            test('arrow function expression');
            test('yield expression');
            test('tagged template expression');
        });

        suite('Classes', function () {
            test('class');
            test('class body');
            test('method definition');
            test('class declaration');
            test('meta property');
        });

        suite('Modules', function () {
            test('module declaration');
            test('module specifier');
            test('import declaration');
            test('import specifier');
            test('import default specifier');
            test('import namespace specifier');
            test('export named declaration');
            test('export specifier');
            test('export default declaration');
            test('export all declaration');
        });

        suite('Clauses', function () {
            test('switchcase');
            test('case clause');
        });

        suite('Miscellaneous', function () {
            test('identifier');
            test('literal');
            test('regexp literal');
            test('unary operator');
            test('binary operator');
            test('logical operator');
            test('assignment operator');
            test('update operator');
            test('spread element');
            test('template literal');
            test('template element');
            test('object pattern');
            test('assignment property');
            test('assignment pattern');
            test('array pattern');
            test('rest element');
        });
    });
});
