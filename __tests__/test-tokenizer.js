const fs = require('fs');
const path = require('path');
const tokenizer = require('../tokenizer.js');

const src = fs.readFileSync(path.join(__dirname, './files/file.js'), 'utf8');

const expected1 = [
  { 'type': 'Keyword', value: 'function' },
  { 'type': 'Identifier', value: 'hi' }
];
const result1 = tokenizer(src);

test('tokenizer function', () => {
  expect(result1).toEqual(expected1);
});