const fs = require('fs');
const path = require('path');
const transformer = require('../src/3-transformer.js');

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

const expected1 = {
  "type": "Program",
  "body": [
    {
      "type": "FunctionDeclaration",
      "id": {
        "type": "Identifier",
        "name": "hi"
      },
      "params": [],
      "body": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "VariableDeclaration",
            "declarations": [
              {
                "type": "VariableDeclarator",
                "id": {
                  "type": "Identifier",
                  "name": "name"
                },
                "init": {
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
                        "value": 0,
                        "raw": "0"
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
                    "value": "Bo",
                    "raw": "'Bo'"
                  }
                }
              }
            ],
            "kind": "var"
          },
          {
            "type": "VariableDeclaration",
            "declarations": [
              {
                "type": "VariableDeclarator",
                "id": {
                  "type": "Identifier",
                  "name": "age"
                },
                "init": {
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
                        "value": 1,
                        "raw": "1"
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
                          "value": 1,
                          "raw": "1"
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
                      "value": 1,
                      "raw": "1"
                    }
                  },
                  "alternate": {
                    "type": "Literal",
                    "value": "18",
                    "raw": "'18'"
                  }
                }
              }
            ],
            "kind": "var"
          },
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


const result1 = transformer(ast);


test('transformer', () => {
  expect(result1).toEqual(expected1);
});