const traverser = require('./traverser.js');

let ast = {
  "type": "Program",
  "body": [
    {
      "type": "FunctionDeclaration",
      "id": {
        "type": "Identifier",
        "name": "hi"
      },
      "params": [
        {
          "type": "AssignmentPattern",
          "left": {
            "type": "Identifier",
            "name": "name"
          },
          "right": {
            "type": "Literal",
            "value": "Bo",
            "raw": "'Bo'"
          }
        },
        // {
        //   "type": "AssignmentPattern",
        //   "left": {
        //     "type": "Identifier",
        //     "name": "age"
        //   },
        //   "right": {
        //     "type": "Literal",
        //     "value": "18",
        //     "raw": "'18'"
        //   }
        // }
      ],
      "body": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ReturnStatement",
            "argument": {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "object": {
                  "type": "Identifier",
                  "name": "console"
                },
                "property": {
                  "type": "Identifier",
                  "name": "log"
                }
              },
              "arguments": [
                {
                  "type": "BinaryExpression",
                  "operator": "+",
                  "left": {
                    "type": "BinaryExpression",
                    "operator": "+",
                    "left": {
                      "type": "BinaryExpression",
                      "operator": "+",
                      "left": {
                        "type": "Literal",
                        "value": "hi there, it is ",
                        "raw": "'hi there, it is '"
                      },
                      "right": {
                        "type": "Identifier",
                        "name": "name"
                      }
                    },
                    "right": {
                      "type": "Literal",
                      "value": " I am ",
                      "raw": "' I am '"
                    }
                  },
                  "right": {
                    "type": "Identifier",
                    "name": "age"
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
};

function transformer(ast) {

  let newAst = {
    "type": "Program",
    "body": []
  };

  ast._context = newAst.body;

  traverser(ast, {
    'FunctionDeclaration': {
      enter(node, parent) {

        function VariableDeclaration (name, init) {
          return `{
            "type": "VariableDeclaration",
            "declarations": [
              {
                "type": "VariableDeclarator",
                "id": {
                  "type": "Identifier",
                  "name": "${name}"
                },
                "init": ${init}
              }
            ],
            "kind": "var"
          }`;
        }

        function initConditionalExpression (index, value) {
          return `{
            "type": "ConditionalExpression",
            "test": {
              "type": "LogicalExpression",
              "operator": "&&",
              "left": {
                "type": "BinaryExpression",
                "operator": ">",
                "left": {
                  "type": "MemberExpression",
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
                  "value": ${index},
                  "raw": "${index}"
                }
              },
              "right": {
                "type": "BinaryExpression",
                "operator": "!==",
                "left": {
                  "type": "MemberExpression",
                  "object": {
                    "type": "Identifier",
                    "name": "arguments"
                  },
                  "property": {
                    "type": "Literal",
                    "value": ${index},
                    "raw": "${index}"
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
              "object": {
                "type": "Identifier",
                "name": "arguments"
              },
              "property": {
                "type": "Literal",
                "value": ${index},
                "raw": "${index}"
              }
            },
            "alternate": {
              "type": "Literal",
              "value": "${value}",
              "raw": "'${value}'"
            }
          }`;
        }

        function initMemberExpression (index, value) {
          return `{
            "type": "MemberExpression",
            "object": {
              "type": "Identifier",
              "name": "arguments"
            },
            "property": {
              "type": "Literal",
              "value": ${index},
              "raw": "${index}"
            }
          }`
        }

        let allIdentifier = true;
        node.params.forEach((childNode) => {
          if (childNode.type !== 'Identifier') return allIdentifier = false;
        });

        if (allIdentifier) {
          parent._context.push(parent.body);
        } else {

          parent._context.push({
            "type": node.type,
            "id": node.id,
            "params": [],
            "body": {
              "type": "BlockStatement",
              "body": node.body.body
            }
          });

          node.params.forEach((childNode, key) => {

            if (childNode.type === 'AssignmentPattern') {

              let index = key;
              let value = childNode.right.value;
              let name = childNode.left.name;

              let initConditionalExpressionStr = initConditionalExpression(index, value);
              let VariableDeclarationObj = JSON.parse(VariableDeclaration(name, initConditionalExpressionStr));

              parent._context[0].body.body.splice(index, 0, VariableDeclarationObj);

            } else if (childNode.type === 'Identifier') {
              
              let index = key;
              let value = childNode.right.value;
              let name = childNode.left.name;

              let initMemberExpressionStr = initMemberExpression(index, value);
              let VariableDeclarationObj = JSON.parse(VariableDeclaration(name, initMemberExpressionStr));

              parent._context[0].body.body.splice(index, 0, VariableDeclarationObj);
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

transformer(ast);

module.exports = transformer;