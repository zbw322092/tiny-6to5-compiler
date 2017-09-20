const tokens = [];
let current = 0;

// Regex
const FUNCTION = /\b(function)\b/;
const LETTERS = /[a-z]/i;
const WHITESPACE = /\s/;

function tokenizer (input) {
  if (typeof input !== 'string') throw new Error('input should be a string');
  input = input.trim();

  let char = input[current];

  while (current < input.length) {

    if (LETTERS.test(char)) {
      let value = '';
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      if (FUNCTION.test(value)) {
        tokens.push({ 'type': 'Keyword', value: 'function' });
      } else {
        throw new Error('begin with unknown keyword');
      }

    }

    ++current;
  }

  return tokens;
}

module.exports = tokenizer;