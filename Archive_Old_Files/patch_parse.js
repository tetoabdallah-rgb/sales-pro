const fs = require('fs');
const path = require('path');

let file = path.join('e:/AI/apk/SalesProWeb', 'ui-components.js');
let content = fs.readFileSync(file, 'utf-8');

content = content.replace("let wb = XLSX.read(e.target.result, {type:'array'});", "let wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});");

fs.writeFileSync(file, content, 'utf-8');
console.log('Patched parseFile in ui-components.js');
