const { 
  isIdentifierStart,
  isIdentifierPart
 } = require('./character.js');

const tokens = [];
let current = 0;

function tokenizer (input) {
  if (typeof input !== 'string') throw new Error('input should be a string');
  input = input.trim();

  while (current < input.length) {

    let char = input.charCodeAt(current);
    
    if (isIdentifierPart(char)) {
      let value = '';
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

      continue;
    }

    ++current;
  }

  return tokens;
}

module.exports = tokenizer;
