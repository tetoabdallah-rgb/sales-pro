const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/\.cw\s*\{\s*position:\s*relative;\s*height:\s*240px;/g, ".cw { position: relative; height: 400px;");

fs.writeFileSync('index.html', code, 'utf8');
console.log(".cw height updated.");
