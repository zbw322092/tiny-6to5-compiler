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

  function walk() {
    const token = tokens[current];

    if (token.type === 'Keyword') {
      if (token.value === 'function') {
        if (tokens[current + 1].type === 'Identifier') {

          const node = {
            "type": "FunctionDeclaration",
            "id": {
              "type": "Identifier",
              "name": tokens[++current].value
            },
            "params": []
          };

          ++current;
          if (tokens[current].type === "Punctuator" && tokens[current].value === "(") {
            ++current;
            while (
              tokens[current] && tokens[current].type === "Identifier"
            ) {
              if (tokens[current+1].type === "Punctuator") {
                switch (tokens[current+1].value) {
                  case ')':
                    node.params.push({
                      "type": "Identifier",
                      "name": tokens[current]
                    });
                    current+=2;
                    break;
                  case ',':
                    node.params.push({ "type": "Identifier", "name": tokens[current].value });
                    current+=2;
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

                      if(tokens[current+3].type==="Punctuator") {
                        switch (tokens[current+3].value) {
                          case ')':
                            current+=3;
                            break;
                          case ',':
                            current+=4;
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

            return node;
            debugger;
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
  }

  return walk();


}

console.dir(parser(tokens1));