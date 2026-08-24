const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

// Change chart container heights
code = code.replace(/height:350px/g, 'height:450px');
code = code.replace(/height: 350px/g, 'height:450px');
fs.writeFileSync('new_features.js', code, 'utf8');
console.log("Charts resized.");
