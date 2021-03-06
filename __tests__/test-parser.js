const fs = require('fs');
const path = require('path');
const parser = require('../src/2-parser.js');

const expected1 =
  {
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
          {
            "type": "AssignmentPattern",
            "left": {
              "type": "Identifier",
              "name": "age"
            },
            "right": {
              "type": "Literal",
              "value": "18",
              "raw": "'18'"
            }
          }
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

const result1 = parser;


test('parser', () => {
  expect(result1).toEqual(expected1);
});