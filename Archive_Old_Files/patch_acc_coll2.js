const fs = require('fs');

let file = 'e:/AI/apk/SalesProWeb/ui-components.js';
let content = fs.readFileSync(file, 'utf-8');

// ====== FIX 1: rAcc - Force DEF_ACC ======
let oldAcc = `function rAcc() {
    let ds = getFilteredSales().filter(r => isAcc(r['Item Class Name']));`;
let newAcc = `function rAcc() {
    // Always use DEF_ACC as base; accCats overrides only if user saved custom ones
    let _accList = (accCats && accCats.length) ? accCats : DEF_ACC;
    let ds = getFilteredSales().filter(r => _accList.includes(r['Item Class Name']));`;

if (content.includes(oldAcc)) {
    content = content.replace(oldAcc, newAcc);
    console.log('FIX 1: rAcc patched OK');
} else {
    // Try with \r\n
    let oldAcc2 = "function rAcc() {\r\n    let ds = getFilteredSales().filter(r => isAcc(r['Item Class Name']));";
    let newAcc2 = "function rAcc() {\r\n    // Always use DEF_ACC as base; accCats overrides only if user saved custom ones\r\n    let _accList = (accCats && accCats.length) ? accCats : DEF_ACC;\r\n    let ds = getFilteredSales().filter(r => _accList.includes(r['Item Class Name']));";
    if (content.includes(oldAcc2)) {
        content = content.replace(oldAcc2, newAcc2);
        console.log('FIX 1: rAcc patched OK (CRLF)');
    } else {
        console.log('FIX 1: rAcc not found');
        // Print surrounding to debug
        let idx = content.indexOf('function rAcc()');
        console.log('rAcc at:', idx, '\nNext 200 chars:\n', JSON.stringify(content.substring(idx, idx+200)));
    }
}

// ====== FIX 2: rCollections - Read acc/hw always from Sales ======
let idx = content.indexOf('function rCollections()');
if (idx !== -1) {
    // Find the body start
    let bodyStart = content.indexOf('{', idx) + 1;
    
    // We inject at the top of the function
    let inject = `
    // Read Accessories/Hardware from Sales sheet (not from Collections)
    let _accList2 = (accCats && accCats.length) ? accCats : DEF_ACC;
    let _hwList2  = (hwCats  && hwCats.length)  ? hwCats  : DEF_HW;
    let accTot_s = 0, hwTot_s = 0;
    S.forEach(function(s) {
        let v = getRowVal(s, ['Sales After Discount', 'Sales']);
        if (_accList2.includes(s['Item Class Name'])) accTot_s += v;
        if (_hwList2.includes(s['Item Class Name']))  hwTot_s  += v;
    });
`;
    content = content.substring(0, bodyStart) + inject + content.substring(bodyStart);
    console.log('FIX 2: rCollections top injected');
    
    // Now replace accTot and hwTot in the UI display part to use accTot_s and hwTot_s
    content = content.replace('${aFmt(accTot)}', '${aFmt(accTot_s)}');
    content = content.replace('${aFmt(hwTot)}', '${aFmt(hwTot_s)}');
    console.log('FIX 2: acc/hw display values updated');
} else {
    console.log('FIX 2: rCollections not found');
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Done!');
