const fs = require('fs');
const path = require('path');
const tokenizer = require('../tokenizer.js');

const src = fs.readFileSync(path.join(__dirname, './files/file.js'), 'utf8');
const src2 = fs.readFileSync(path.join(__dirname, './files/file2-unexpected-token.js'), 'utf8');

const expected1 = [
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
const result1 = tokenizer(src);

const expected2 = 'TypeError: Unexpected token: I dont know what this character is: 1';
// const result2 = tokenizer(src2);


test('tokenizer function', () => {
  expect(result1).toEqual(expected1);
});

// test('throw unexpected token error', () => {
//   expect(result2).toThrowError(expected2);
// });