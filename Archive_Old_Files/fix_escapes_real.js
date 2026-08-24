const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
c = c.split('\\\\${').join('${');
c = c.split('\\\\n').join('\\n');
fs.writeFileSync('index.html', c);
console.log('Fixed escaped chars in index.html with split-join');
