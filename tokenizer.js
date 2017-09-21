const { 
  isIdentifierStart,
  isIdentifierPart,
  punctuators
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
      while (char !== 0x27 && char !== 0x22) {
        value += String.fromCharCode(char);
        char = input.charCodeAt(++current);
      }
      value += "'";
      
      tokens.push({ "type": "String", "value": value });
    }
    
    if (isIdentifierPart(char)) {
      let value = "";
      while (isIdentifierPart(char)) {
        value += String.fromCharCode(char);
        char = input.charCodeAt(++current);
      }

      if (value === 'function') {
        tokens.push({ "type": "Keyword", "value": "function" });
      } else if (value === 'null') {
        tokens.push({ "type": "Null", "value": "null" });
      } else if (value === 'true' || value ==='false') {
        tokens.push({ "type": "Boolean", "value": value });
      } else {
        tokens.push({ "type": "Identifier", "value": value });
      }

    }

    if (punctuators.includes(String.fromCharCode(char))) {
      tokens.push({ "type": "Punctuator", "value": String.fromCharCode(char) });
    }

    ++current;
  }

  return tokens;
}

module.exports = tokenizer;
