const tokens = [
  {
    "type": "Keyword",
    "value": "function"
  },
  {
    "type": "Identifier",
    "value": "hi"
  },
  {
    "type": "Punctuator",
    "value": "("
  },
  {
    "type": "Identifier",
    "value": "name"
  },
  {
    "type": "Punctuator",
    "value": "="
  },
  {
    "type": "String",
    "value": "'Bo'"
  },
  {
    "type": "Punctuator",
    "value": ","
  },
  {
    "type": "Identifier",
    "value": "age"
  },
  {
    "type": "Punctuator",
    "value": "="
  },
  {
    "type": "String",
    "value": "'18'"
  },
  {
    "type": "Punctuator",
    "value": ")"
  },
  {
    "type": "Punctuator",
    "value": "{"
  },
  {
    "type": "Keyword",
    "value": "return"
  },
  {
    "type": "Identifier",
    "value": "console"
  },
  {
    "type": "Punctuator",
    "value": "."
  },
  {
    "type": "Identifier",
    "value": "log"
  },
  {
    "type": "Punctuator",
    "value": "("
  },
  {
    "type": "String",
    "value": "'hi there, it is '"
  },
  {
    "type": "Punctuator",
    "value": "+"
  },
  {
    "type": "Identifier",
    "value": "name"
  },
  {
    "type": "Punctuator",
    "value": "+"
  },
  {
    "type": "String",
    "value": "' I am '"
  },
  {
    "type": "Punctuator",
    "value": "+"
  },
  {
    "type": "Identifier",
    "value": "age"
  },
  {
    "type": "Punctuator",
    "value": ")"
  },
  {
    "type": "Punctuator",
    "value": ";"
  },
  {
    "type": "Punctuator",
    "value": "}"
  }
];

const tokens1 = [
  {
    "type": "Keyword",
    "value": "function"
  },
  {
    "type": "Identifier",
    "value": "hi"
  },
  {
    "type": "Punctuator",
    "value": "("
  },
  {
    "type": "Identifier",
    "value": "name"
  },
  {
    "type": "Punctuator",
    "value": "="
  },
  {
    "type": "String",
    "value": "'Bo'"
  },
  {
    "type": "Punctuator",
    "value": ","
  },
  {
    "type": "Identifier",
    "value": "age"
  },
  {
    "type": "Punctuator",
    "value": "="
  },
  {
    "type": "String",
    "value": "'18'"
  },
  {
    "type": "Punctuator",
    "value": ")"
  }
];

function parser(tokens) {
  let current = 0;

  let token = tokens[current];
  let node;

  if (token.type === 'Keyword') {
    if (token.value === 'function') {
      if (tokens[current + 1].type === 'Identifier') {

        node = {
          "type": "FunctionDeclaration",
          "id": {
            "type": "Identifier",
            "name": tokens[++current].value
          },
          "params": [],
          "body": {}
        };

        ++current;
        if (tokens[current].type === "Punctuator" && tokens[current].value === "(") {
          ++current;
          while (
            tokens[current] && tokens[current].type === "Identifier"
          ) {
            if (tokens[current + 1].type === "Punctuator") {
              switch (tokens[current + 1].value) {
                case ')':
                  node.params.push({
                    "type": "Identifier",
                    "name": tokens[current]
                  });
                  current += 1;
                  break;
                case ',':
                  node.params.push({ "type": "Identifier", "name": tokens[current].value });
                  current += 2;
                  continue;
                case '=':
                  if (tokens[current + 2].type === 'String') {
                    node.params.push({
                      "type": "AssignmentPattern",
                      "left": {
                        "type": "Identifier",
                        "name": tokens[current].value
                      },
                      "right": {
                        "type": "Literal",
                        "value": tokens[current + 2].value,
                        "raw": tokens[current + 2].value
                      }
                    });

                    if (tokens[current + 3].type === "Punctuator") {
                      switch (tokens[current + 3].value) {
                        case ')':
                          current += 3;
                          break;
                        case ',':
                          current += 4;
                          continue;
                        default:
                          throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current].type);
                      }
                    }
                    continue;
                  } else {
                    throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current].type);
                  }
                default:
                  throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current].value);
                  break;
              }

            } else {
              throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current].type);
            }
          }

          if (
            tokens[current] &&
            !(tokens[current].type === "Punctuator" && tokens[current].value === ")")
          ) {
            throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current].value);
          }

        } else {
          throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current].type);
        }

      } else {
        throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current].type);
      }

    }

  } else {
    throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.type);
  }

  ++current;
  if (tokens[current].type === 'Punctuator' && tokens[current].value === '{') {
    Object.assign(node.body, {
      "type": "BlockStatement",
      "body": []
    });
    const blockBody = node.body.body;

    ++current;
    if (tokens[current].type === 'Keyword' && tokens[current].value === 'return') {
      blockBody.push({
        "type": "ReturnStatement",
        "argument": {}
      });

      const returnArguments = blockBody[0].argument;

      if (tokens[current].type === 'Identifier' && tokens[current].value === 'console') {
        ++current;
        if (tokens[current].type === 'Punctuator' && tokens[current].value === '.') {
          ++current;
          if (tokens[current].type === 'Identifier' && tokens[current].value === 'log') {
            ++current;
            if (tokens[current].type === 'Punctuator' && tokens[current].value === '(') {
              Object.assign(returnArguments, {
                "type": "CallExpression",
                "callee": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": "console"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "log"
                  }
                },
                "arguments": []
              });
              const callArguments = returnArguments.arguments;

              ++current;

              while (
                tokens[current].type === 'String' || 
                tokens[current].type === 'Identifier'
              ) {
                ++current;

                if (tokens[current].type === 'Punctuator') {

                  switch(tokens[current].value) {
                    case ',':
                      callArguments.push({ "type": "Identifier", "name": tokens[current-1].value });
                      ++current;
                      continue;
                    case '+':
                      ++current;
                      while (
                        tokens[current].type === 'Identifier' || 
                        tokens[current].type === 'String'
                      ) {
                        let left, right;
                        if (tokens[current-2].type === 'Identifier') {
                          left = {
                            "type": "Identifier",
                            "name": tokens[current-2].value
                          }
                        } else {
                          left = {
                            "type": "Literal",
                            "value": tokens[current-2].value,
                            "raw": tokens[current-2].value
                          }
                        }

                        if (tokens[current].type === 'Identifier') {
                          right = {
                            "type": "Identifier",
                            "name": tokens[current].value
                          }
                        } else {
                          right = {
                            "type": "Literal",
                            "value": tokens[current].value,
                            "raw": tokens[current].value
                          }
                        }
                        callArguments.push({ 
                          "type": "BinaryExpression", 
                          "operator": "+",
                          "left": left,
                          "right": right
                        });

                      }
                      break;
                    case ')':
                      callArguments.push({ "type": "Literal", "value": tokens[current-1].value, "raw": tokens[current-1].value });
                      break;
                    default:
                      throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.value);
                  }

                } else {
                  throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.type);
                }

              }

            } else {
              throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.value);
            }
          } else {
            throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.value);
          }
        } else {
          throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.value);
        }
      } else {
        throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.value);
      }

    } else {
      throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.value);
    }

  } else {
    throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.type);
  }

}

console.dir(parser(tokens));