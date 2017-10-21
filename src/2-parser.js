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
                        "value": tokens[current + 2].value.slice(1,-1),
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
      ++current;
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

                  switch (tokens[current].value) {
                    case ',':
                      callArguments.push({ "type": "Identifier", "name": tokens[current - 1].value });
                      ++current;
                      continue;
                    case '+':
                      if (!(callArguments.length >= 1 && callArguments[callArguments.length - 1].type === 'BinaryExpression')) {
                        ++current;
                      } else {
                        --current;
                      }
                      if (
                        tokens[current].type === 'Identifier' ||
                        tokens[current].type === 'String'
                      ) {
                        let left, right;

                        if (tokens[current].type === 'Identifier') {
                          right = {
                            "type": "Identifier",
                            "name": tokens[current].value
                          }
                        } else {
                          right = {
                            "type": "Literal",
                            "value": tokens[current].value.slice(1,-1),
                            "raw": tokens[current].value
                          }
                        }
                        if (callArguments.length >= 1 && callArguments[callArguments.length - 1].type === 'BinaryExpression') {
                          callArguments[callArguments.length - 1] = {
                            "type": "BinaryExpression",
                            "operator": "+",
                            left: callArguments[callArguments.length - 1],
                            right: right
                          }
                        } else {
                          if (tokens[current - 2].type === 'Identifier') {
                            left = {
                              "type": "Identifier",
                              "name": tokens[current - 2].value
                            }
                          } else {
                            left = {
                              "type": "Literal",
                              "value": tokens[current - 2].value.slice(1,-1),
                              "raw": tokens[current - 2].value
                            }
                          }
                          callArguments.push({
                            "type": "BinaryExpression",
                            "operator": "+",
                            "left": left,
                            "right": right
                          });
                        }
                      }
                      if (tokens[current + 1].type === 'Punctuator') {
                        if (tokens[current + 1].value === ',') {
                          current += 2;
                          continue;
                        } else if (tokens[current + 1].value === ')') {
                          break;
                        } else if (tokens[current + 1].value === '+') {
                          current += 2;
                          continue;
                        } else {
                          throw new TypeError('Uncaught SyntaxError: Unexpected ' + tokens[current + 1].value);
                        }
                      } else {
                        throw new TypeError('Uncaught SyntaxError: Unexpected ' + token.type);
                      }
                      break;
                    case ')':
                      if (callArguments.length >= 1 && callArguments[callArguments.length - 1].type === 'BinaryExpression') {

                        let right;

                        if (tokens[current-1].type === 'Identifier') {
                          right = {
                            "type": "Identifier",
                            "name": tokens[current-1].value
                          }
                        } else {
                          right = {
                            "type": "Literal",
                            "value": tokens[current-1].value.slice(1,-1),
                            "raw": tokens[current-1].value
                          }
                        }

                        callArguments[callArguments.length - 1] = {
                          "type": "BinaryExpression",
                          "operator": "+",
                          left: callArguments[callArguments.length - 1],
                          right: right
                        }
                        break;
                      }
                      callArguments.push({ 
                        "type": "Literal", 
                        "value": tokens[current - 1].value.slice(1,-1), 
                        "raw": tokens[current - 1].value 
                      });
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

  let ast = {
    "type": "Program",
    "body": []
  };

  ast.body.push(node);
  return ast;
}

module.exports = parser;