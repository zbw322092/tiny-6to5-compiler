const fs = require('fs');
const path = require('path');

const tokenizer = require('./1-tokenizer.js');
const parser = require('./2-parser.js');
const transformer = require('./3-transformer.js');
const codeGenerator = require('./4-codeGenerator.js');

function complier (input) {
  let output;

  const start = Date.now();

  let tokens = tokenizer(input);
  let ast = parser(tokens);
  let newAst = transformer(ast);
  let code = codeGenerator(newAst);

  const finish = Date.now();

  console.log(`compile done in ${finish - start} ms`);

  output = code;
  return output;
}

module.exports = complier;