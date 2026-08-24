const fs = require('fs');

// Extract original rCollections from old_index.html
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

// Find the "tot += val" line position and what comes after
let totIdx = originalFunc.indexOf('tot += val;');
console.log('tot += val at idx:', totIdx);
console.log('Next 100 chars after tot:', JSON.stringify(originalFunc.substring(totIdx, totIdx + 100)));
