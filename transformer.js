const traverser = require('./traverser.js');

function transformer(ast) {

  let newAst = {
    "type": "Program",
    "body": []
  };

  ast._context = newAst.body;

  traverser(ast, {
    'FunctionDeclaration': {
      enter(node, parent) {

        let VariableDeclarationObj = {
          "type": "VariableDeclaration",
          "declarations": [
            {
              "type": "VariableDeclarator",
              "id": {
                "type": "Identifier",
                "name": "name"
              },
              "init": {}
            }
          ],
          "kind": "var"
        };

        let initConditionalExpressionObj = {
          "type": "ConditionalExpression",
          "test": {
            "type": "LogicalExpression",
            "operator": "&&",
            "left": {
              "type": "BinaryExpression",
              "operator": ">",
              "left": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "arguments"
                },
                "property": {
                  "type": "Identifier",
                  "name": "length"
                }
              },
              "right": {
                "type": "Literal",
                "value": 0,
                "raw": "0"
              }
            },
            "right": {
              "type": "BinaryExpression",
              "operator": "!==",
              "left": {
                "type": "MemberExpression",
                "computed": true,
                "object": {
                  "type": "Identifier",
                  "name": "arguments"
                },
                "property": {
                  "type": "Literal",
                  "value": 0,
                  "raw": "0"
                }
              },
              "right": {
                "type": "Identifier",
                "name": "undefined"
              }
            }
          },
          "consequent": {
            "type": "MemberExpression",
            "computed": true,
            "object": {
              "type": "Identifier",
              "name": "arguments"
            },
            "property": {
              "type": "Literal",
              "value": 0,
              "raw": "0"
            }
          },
          "alternate": {
            "type": "Literal",
            "value": undefined,
            "raw": undefined
          }
        };

        let allIdentifier = true;
        node.params.forEach((childNode) => {
          if (childNode.type !== 'Identifier') return allIdentifier = false;
        });

        if (allIdentifier) {
          parent._context.push(parent.body);
        } else {

          parent._context.push({
            "type": node.type,
            "node": node.id,
            "body": {
              "type": "BlockStatement",
              "body": node.body.body
            }
          });

          node.params.forEach((childNode) => {

            if (childNode.type === 'AssignmentPattern') {
              let initExpression = Object.assign({}, initConditionalExpressionObj, {
                "test": {
                  "right": {
                    "property": {
                      "value": index,
                      "raw": `"${index}"`
                    },
                    "consequent": {
                      "property": {
                        "value": index,
                        "raw": `"${index}"`
                      }
                    },
                    "alternate": childNode.right
                  }
                }
              });
              let VariableDeclaration = Object.assign({}, VariableDeclarationObj);
              VariableDeclaration.declarations[0].init = initExpression;

              parent._context.body.body.unshift(VariableDeclaration);

            } else if (childNode.type === 'Identifier') {
              let initExpression = {
                "type": "MemberExpression",
                "computed": true,
                "object": {
                  "type": "Identifier",
                  "name": "arguments"
                },
                "property": {
                  "type": "Literal",
                  "value": index,
                  "raw": `"${index}"`
                }
              };
              let VariableDeclaration = Object.assign({}, VariableDeclarationObj);
              VariableDeclaration.declarations[0].init = initExpression;

              parent._context.body.body.unshift(VariableDeclaration);
            } else {
              throw TypeError('Invalid node type: ', childNode.type);
            }

          });
        }

      }
    }

  });

  return newAst;

}

module.exports = transformer;