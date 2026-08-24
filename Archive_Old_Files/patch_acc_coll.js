const fs = require('fs');
const path = require('path');

let file = path.join('e:/AI/apk/SalesProWeb', 'ui-components.js');
let content = fs.readFileSync(file, 'utf-8');

// ====== FIX 1: rAcc - Force use DEF_ACC when accCats is empty ======
// Replace the filter in rAcc to always use DEF_ACC list + any accCats
let oldAcc = `function rAcc() {
    let ds = getFilteredSales().filter(r => isAcc(r['Item Class Name']));`;

let newAcc = `function rAcc() {
    // Always use DEF_ACC as default if no custom cats saved
    let _accCatList = (accCats && accCats.length) ? accCats : DEF_ACC;
    let ds = getFilteredSales().filter(r => _accCatList.includes(r['Item Class Name']));`;

if (content.includes(oldAcc)) {
    content = content.replace(oldAcc, newAcc);
    console.log('FIX 1: rAcc patched');
} else {
    console.log('FIX 1: rAcc pattern not found, skipping');
}

// ====== FIX 2: rCollections - Always read acc/hw from Sales sheet ======
let oldColl = `function rCollections() {
    let tot = 0, accTot = 0, hwTot = 0;
    let cAccMap = {}, cHWMap = {};
    if (C.length > 0 && !(C[0]['Item Class Name'] || C[0]['Item Group'] || C[0]['category'] || C[0]['Category'] || C[0]['acc - hw'])) {
        S.forEach(s => {
            let c = s['Customer'];
            if(c) {
                let v = Number(s['Sales After Discount'] || 0);
                if(isAcc(s['Item Class Name'])) cAccMap[c] = (cAccMap[c]||0) + v;
                if(isHW(s['Item Class Name'])) cHWMap[c] = (cHWMap[c]||0) + v;
            }
        });
    }`;

let newColl = `function rCollections() {
    let tot = 0, accTot = 0, hwTot = 0;
    let cAccMap = {}, cHWMap = {};
    
    // Always compute acc/hw from Sales sheet regardless of Collections sheet content
    let _accCatList = (accCats && accCats.length) ? accCats : DEF_ACC;
    let _hwCatList  = (hwCats  && hwCats.length)  ? hwCats  : DEF_HW;
    
    S.forEach(s => {
        let c = s['Customer'];
        if(c) {
            let v = getRowVal(s, ['Sales After Discount', 'Sales']);
            if(_accCatList.includes(s['Item Class Name'])) cAccMap[c] = (cAccMap[c]||0) + v;
            if(_hwCatList.includes(s['Item Class Name']))  cHWMap[c]  = (cHWMap[c]||0)  + v;
        }
    });
    
    // Also compute overall acc/hw totals directly from Sales
    S.forEach(s => {
        let v = getRowVal(s, ['Sales After Discount', 'Sales']);
        if(_accCatList.includes(s['Item Class Name'])) accTot += v;
        if(_hwCatList.includes(s['Item Class Name']))  hwTot  += v;
    });`;

if (content.includes(oldColl)) {
    content = content.replace(oldColl, newColl);
    console.log('FIX 2: rCollections top patched');
} else {
    console.log('FIX 2: rCollections pattern not found - trying partial match');
    let idx = content.indexOf('function rCollections()');
    if (idx !== -1) console.log('rCollections exists at idx', idx);
}

// ====== FIX 3: rCollections - Skip the C.forEach re-calculation of acc/hw ======
// After fixing, the accTot/hwTot already come from Sales, so we just need tot from C
let oldForEach = `    C.forEach(r => {
        let keys = Object.keys(r);
        let getVal = (possibleNames) => {
            let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\\s+/g, '') === pn.toLowerCase().replace(/\\s+/g, '')));
            return k ? r[k] : undefined;
        };
        
        let rawVal = getVal(['Amount', 'Collection']) || 0;
        let val = Number(rawVal.toString().replace(/,/g, '')) || 0;
        let cat = getVal(['Item Class Name', 'Item Group', 'Category']);
        let ahRaw = getVal(['acc-hw', 'acchw', 'acc - hw']);
        let ah = ahRaw ? ahRaw.toString().trim().toLowerCase() : '';
        let cName = getVal(['Customer Name', 'Customer']) || '';
        
        tot += val;
        if (ah.includes('acc') || ah.includes`;

let newForEach = `    C.forEach(r => {
        let keys = Object.keys(r);
        let getVal = (possibleNames) => {
            let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\\s+/g, '') === pn.toLowerCase().replace(/\\s+/g, '')));
            return k ? r[k] : undefined;
        };
        
        let rawVal = getVal(['Amount', 'Collection']) || 0;
        let val = Number(rawVal.toString().replace(/,/g, '')) || 0;
        tot += val;
        if (false && ah.includes`;

if (content.includes(oldForEach)) {
    content = content.replace(oldForEach, newForEach);
    console.log('FIX 3: rCollections forEach patched');
} else {
    console.log('FIX 3: forEach pattern not found - patching tot only');
    // Simpler approach: just add tot calculation
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Done patching ui-components.js');
