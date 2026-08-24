const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

let lines = code.split('\n');
let newLines = lines.filter(line => !line.includes('id="spTitle"'));
fs.writeFileSync('index.html', newLines.join('\n'), 'utf8');
console.log("Watermark removed via line filter!");
