const fs = require('fs');
const path = require('path');
const tokenizer = require('./tokenizer.js');

const src = fs.readFileSync(path.join(__dirname, '__tests__/files/file.js'), 'utf8');

console.log(tokenizer(src));