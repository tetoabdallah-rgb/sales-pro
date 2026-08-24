const fs = require('fs');

// Extract original working rCollections from old_index.html
let oldHtml = fs.readFileSync('e:/AI/apk/SalesProWeb/old_index.html', 'utf-8');
let startIdx = oldHtml.indexOf('function rCollections()');
let braceCount = 0, i = startIdx, inFunc = false;
while (i < oldHtml.length) {
    if (oldHtml[i] === '{') { braceCount++; inFunc = true; }
    if (oldHtml[i] === '}') { braceCount--; }
    if (inFunc && braceCount === 0) { i++; break; }
    i++;
}
let originalFunc = oldHtml.substring(startIdx, i);

// Patch: add Payment Ref. check BEFORE the ah.includes check
let oldSnippet = "tot += val;\r\n        if (ah.includes('acc')";
let newSnippet = "tot += val;\r\n          // Payment Ref. column takes priority: acc=accessories, hw=hardware\r\n          let payRef = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();\r\n          if (payRef.startsWith('acc')) {\r\n              accTot += val;\r\n          } else if (payRef.startsWith('hw')) {\r\n              hwTot += val;\r\n          } else if (ah.includes('acc')";

let patched = originalFunc.replace(oldSnippet, newSnippet);
if (patched === originalFunc) {
    console.log('ERROR: pattern not found!');
    process.exit(1);
}
console.log('Patched successfully');

// Replace in ui-components.js
let uiFile = 'e:/AI/apk/SalesProWeb/ui-components.js';
let uiContent = fs.readFileSync(uiFile, 'utf-8');
let uiStart = uiContent.indexOf('function rCollections()');
let bc = 0, j = uiStart, inf = false;
while (j < uiContent.length) {
    if (uiContent[j] === '{') { bc++; inf = true; }
    if (uiContent[j] === '}') { bc--; }
    if (inf && bc === 0) { j++; break; }
    j++;
}
uiContent = uiContent.substring(0, uiStart) + patched + uiContent.substring(j);
fs.writeFileSync(uiFile, uiContent, 'utf-8');
console.log('Done! rCollections restored + Payment Ref fix applied');
