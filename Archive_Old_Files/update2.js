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

    // Fix C.forEach block
    const forEachRegex = /C\.forEach\\(r\\s*=>\\s*\\{\\s*let val = Number\\(r\\['Amount'\\]\\|\\|r\\['amount'\\]\\|\\|r\\['Collection'\\]\\|\\|0\\);\\s*let cat = r\\['Item Class Name'\\] \\|\\| r\\['Item Group'\\] \\|\\| r\\['category'\\] \\|\\| r\\['Category'\\];\\s*let cName = r\\['Customer Name'\\] \\|\\| r\\['Customer'\\] \\|\\| r\\['customer'\\] \\|\\| '';\\s*tot \\+= val;\\s*if \\(cat\\) \\{\\s*if \\(isAcc\\(cat\\)\\) accTot \\+= val;\\s*else if \\(isHW\\(cat\\)\\) hwTot \\+= val;/g;

    const newForEach = `C.forEach(r => {
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

    content = content.replace(forEachRegex, newForEach);

    // Improve parseFile to use fuzzy match for sheet name
    const oldParseFile = "let ws = (sheetName && wb.Sheets[sheetName]) ? wb.Sheets[sheetName] : wb.Sheets[wb.SheetNames[0]];";
    const newParseFile = `let ws;
                if (sheetName) {
                    let sName = wb.SheetNames.find(s => s.trim().toLowerCase() === sheetName.trim().toLowerCase());
                    ws = sName ? wb.Sheets[sName] : wb.Sheets[wb.SheetNames[0]];
                } else {
                    ws = wb.Sheets[wb.SheetNames[0]];
                }`;
    content = content.replace(oldParseFile, newParseFile);

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', p);
}
