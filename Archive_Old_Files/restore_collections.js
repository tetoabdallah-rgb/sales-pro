const fs = require('fs');

// Read old_index.html to extract original working rCollections
let oldHtml = fs.readFileSync('e:/AI/apk/SalesProWeb/old_index.html', 'utf-8');

let startIdx = oldHtml.indexOf('function rCollections()');
if (startIdx === -1) { console.log('ERROR: Not found in old_index'); process.exit(1); }

// Find closing brace
let braceCount = 0, i = startIdx, inFunc = false;
while (i < oldHtml.length) {
    if (oldHtml[i] === '{') { braceCount++; inFunc = true; }
    if (oldHtml[i] === '}') { braceCount--; }
    if (inFunc && braceCount === 0) { i++; break; }
    i++;
}
let originalFunc = oldHtml.substring(startIdx, i);
console.log('Original function extracted, length:', originalFunc.length);

// Now add Payment Ref. logic INSIDE it: right before "tot += val;"
// Original line: "        tot += val;"
// We add: check Payment Ref. first
let oldLine = `        tot += val;\r\n          if (ah.includes('acc')`;
let newLine = `        tot += val;\r\n          // Check Payment Ref. column (acc/hw) FIRST\r\n          let payRef = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();\r\n          if (payRef.startsWith('acc') || payRef === 'acc') {\r\n              accTot += val;\r\n          } else if (payRef.startsWith('hw') || payRef === 'hw') {\r\n              hwTot += val;\r\n          } else if (ah.includes('acc')`;

let patched = originalFunc.replace(oldLine, newLine);

if (patched === originalFunc) {
    console.log('WARNING: Payment Ref patch not applied - trying CRLF variant');
    // Try without \r
    let oldLine2 = "        tot += val;\n          if (ah.includes('acc')";
    let newLine2 = "        tot += val;\n          let payRef = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();\n          if (payRef.startsWith('acc') || payRef === 'acc') {\n              accTot += val;\n          } else if (payRef.startsWith('hw') || payRef === 'hw') {\n              hwTot += val;\n          } else if (ah.includes('acc')";
    patched = originalFunc.replace(oldLine2, newLine2);
    if (patched === originalFunc) {
        console.log('ERROR: Could not patch. Saving original as-is.');
    } else {
        console.log('Patched with LF variant');
    }
} else {
    console.log('Patched with CRLF variant');
}

// Now replace in ui-components.js
let uiFile = 'e:/AI/apk/SalesProWeb/ui-components.js';
let uiContent = fs.readFileSync(uiFile, 'utf-8');

let uiStart = uiContent.indexOf('function rCollections()');
let braceCount2 = 0, j = uiStart, inFunc2 = false;
while (j < uiContent.length) {
    if (uiContent[j] === '{') { braceCount2++; inFunc2 = true; }
    if (uiContent[j] === '}') { braceCount2--; }
    if (inFunc2 && braceCount2 === 0) { j++; break; }
    j++;
}

uiContent = uiContent.substring(0, uiStart) + patched + uiContent.substring(j);
fs.writeFileSync(uiFile, uiContent, 'utf-8');
console.log('ui-components.js updated with clean rCollections + Payment Ref fix');
