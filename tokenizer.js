const { 
  isIdentifierStart,
  isIdentifierPart,
  punctuators,
  whiteSpace
 } = require('./character.js');

const tokens = [];
let current = 0;

function tokenizer (input) {
  if (typeof input !== 'string') throw new Error('input should be a string');
  input = input.trim();

  while (current < input.length) {

    let char = input.charCodeAt(current);

    if (char === 0x27) {
      let value = "'";
      char = input.charCodeAt(++current);
      while (char !== 0x27) {
        value += String.fromCharCode(char);
        char = input.charCodeAt(++current);
      }
      value += "'";
      
      tokens.push({ "type": "String", "value": value });

      ++current;
      continue;
    }
    
    if (isIdentifierStart(char)) {
      let value = "";
      while (isIdentifierPart(char)) {
        value += String.fromCharCode(char);
        char = input.charCodeAt(++current);
      }

      if (value === 'function' || value === 'return') {
        tokens.push({ "type": "Keyword", "value": value });
      } else if (value === 'null') {
        tokens.push({ "type": "Null", "value": "null" });
      } else if (value === 'true' || value ==='false') {
        tokens.push({ "type": "Boolean", "value": value });
      } else {
        tokens.push({ "type": "Identifier", "value": value });
      }

      continue;
    }

    if (punctuators.includes(String.fromCharCode(char))) {
      tokens.push({ "type": "Punctuator", "value": String.fromCharCode(char) });

      ++current;
      continue;
    }

    if (whiteSpace.test(String.fromCharCode(char))) {
      ++current;
      continue;
    }

    throw new TypeError('Unexpected token: I dont know what this character is: ' + String.fromCharCode(char));
  }

  return tokens;
}

module.exports = tokenizer;
