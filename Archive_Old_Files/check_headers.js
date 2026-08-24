const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
['rDash', 'rSales', 'rTgt', 'rPers', 'rCust'].forEach(fn => {
    let idx = c.indexOf('function ' + fn);
    let innerIdx = c.indexOf("$('M').innerHTML", idx);
    if (innerIdx !== -1 && (innerIdx - idx < 5000)) {
        console.log(fn + ' innerHTML:\n', c.substring(innerIdx, innerIdx + 300));
    }
});
