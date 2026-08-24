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

    // Find the start of C.forEach
    let startIdx = content.indexOf('C.forEach(r => {');
    if (startIdx !== -1) {
        let endLogicIdx = content.indexOf('tot += val;', startIdx);
        if (endLogicIdx !== -1) {
            let actualEndIdx = content.indexOf('hwTot += val;', endLogicIdx);
            if (actualEndIdx !== -1) {
                // The block we are replacing
                let oldBlock = content.substring(startIdx, actualEndIdx + 'hwTot += val;'.length);
                let newBlock = `C.forEach(r => {
        let val = Number(r['Amount']||r['amount']||r['Collection']||0);
        let cat = r['Item Class Name'] || r['Item Group'] || r['category'] || r['Category'];
        let ah = r['acc - hw'] ? r['acc - hw'].toString().trim().toLowerCase() : '';
        let cName = r['Customer Name'] || r['Customer'] || r['customer'] || '';
        
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
    }

    // Fix parseFile
    let parseFileRegex = /let ws = \(sheetName && wb\.Sheets\[sheetName\]\) \? wb\.Sheets\[sheetName\] \: wb\.Sheets\[wb\.SheetNames\[0\]\];/;
    let parseFileNew = `let ws;
                if (sheetName) {
                    let sName = wb.SheetNames.find(s => s.trim().toLowerCase() === sheetName.trim().toLowerCase());
                    ws = sName ? wb.Sheets[sName] : wb.Sheets[wb.SheetNames[0]];
                } else {
                    ws = wb.Sheets[wb.SheetNames[0]];
                }`;
    content = content.replace(parseFileRegex, parseFileNew);

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', p);
}
