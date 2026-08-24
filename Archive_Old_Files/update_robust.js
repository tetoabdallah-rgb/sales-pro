const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'index_bundle.html',
    'index_final.html',
    'index_github.html',
    'old_index.html',
    'ui-components.js'
];

for (let file of files) {
    let p = path.join('e:/AI/apk/SalesProWeb', file);
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf-8');

    // Replace the C.forEach logic with dynamic key matching
    let startIdx = content.indexOf('C.forEach(r => {');
    if (startIdx !== -1) {
        let actualEndIdx = content.indexOf('hwTot += val;', startIdx);
        if (actualEndIdx !== -1) {
            let oldBlock = content.substring(startIdx, actualEndIdx + 'hwTot += val;'.length);
            let newBlock = `C.forEach(r => {
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
        if (ah.includes('acc') || ah.includes('اكسسوار')) {
            accTot += val;
        } else if (ah.includes('hw') || ah.includes('هاردوير') || ah.includes('هارد')) {
            hwTot += val;
        } else if (cat) {
            if (isAcc(cat)) accTot += val;
            else if (isHW(cat)) hwTot += val;`;
            content = content.replace(oldBlock, newBlock);
        }
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', p);
}
