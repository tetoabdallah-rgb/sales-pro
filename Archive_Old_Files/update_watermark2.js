const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

// For body::after
code = code.replace(/background-size:\s*min\(600px,\s*90%\);/g, "background-size: contain;");
// For loader-overlay::after
code = code.replace(/background-size:\s*min\(400px,\s*80%\);/g, "background-size: 90vw;");

fs.writeFileSync('new_features.js', code, 'utf8');
console.log('Watermark size updated in new_features.js');
