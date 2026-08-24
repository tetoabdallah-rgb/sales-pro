const fs = require('fs');
const jsPath = 'scripts/main.js';
let content = fs.readFileSync(jsPath, 'utf8');

const lines = content.split('\n');
const truncatedLines = lines.slice(0, 4421); // Keep up to line 4420 (which is index 4420, plus one empty line)

fs.writeFileSync(jsPath, truncatedLines.join('\n'), 'utf8');
console.log(`File truncated successfully to ${truncatedLines.length} lines.`);
