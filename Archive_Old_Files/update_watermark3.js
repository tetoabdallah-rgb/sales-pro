const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

code = code.replace(/background-size:\s*contain;/g, "background-size: 100vw 100vh;");
code = code.replace(/background-size:\s*90vw;/g, "background-size: 100vw 100vh;");

fs.writeFileSync('new_features.js', code, 'utf8');
console.log('Watermark size updated to 100vw 100vh');
