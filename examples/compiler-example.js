const fs = require('fs');
const path = require('path');
const compiler = require('../compiler.js');

let input = fs.readFileSync(path.join(__dirname, 'files/input-file.js'), 'utf8');

let output = compiler(input);

fs.writeFileSync(path.join(__dirname, 'files/output-file.js'), output, {
  encoding: 'utf8'
});