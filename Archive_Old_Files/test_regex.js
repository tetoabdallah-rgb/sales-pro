const fs = require('fs');
let code = fs.readFileSync('index.html.restored3', 'utf8');
let regex = /datalabels:\s*\{\s*color:\s*'#fff',\s*font:\s*\{\s*weight:\s*'bold',\s*size:\s*10\s*\},[\s\S]*?return\s*true;\s*\}\s*\}/g;
let matches = code.match(regex);
console.log(`Found ${matches ? matches.length : 0} matches.`);
