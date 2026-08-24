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
    if (!fs.existsSync(p)) {
        console.log('Not found:', p);
        continue;
    }
    let content = fs.readFileSync(p, 'utf-8');
    let original = content;

    // 1. Update parseFile
    content = content.replace(
        "let ws = wb.Sheets[wb.SheetNames[0]];",
        "let ws = (sheetName && wb.Sheets[sheetName]) ? wb.Sheets[sheetName] : wb.Sheets[wb.SheetNames[0]];"
    );
    content = content.replace(
        "function parseFile(file, cb) {",
        "function parseFile(file, cb, sheetName) {"
    );

    // 2. Update fP parsing
    content = content.replace(
        "if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) { toast(L==='ar'?TUI('? Done'):'? Done'); render(); } }); }",
        "if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) { toast(L==='ar'?TUI('? Done'):'? Done'); render(); } }, 'Payment Ref'); }"
    );

    // 3. Update C.length check
    content = content.replace(
        "if (C.length > 0 && !(C[0]['Item Class Name'] || C[0]['Item Group'] || C[0]['category'] || C[0]['Category'])) {",
        "if (C.length > 0 && !(C[0]['Item Class Name'] || C[0]['Item Group'] || C[0]['category'] || C[0]['Category'] || C[0]['acc - hw'])) {"
    );

    // 4. Update iteration logic
    const oldLogic = `C.forEach(r => {
        let val = Number(r['Amount']||r['amount']||r['Collection']||0);
        let cat = r['Item Class Name'] || r['Item Group'] || r['category'] || r['Category'];
        let cName = r['Customer Name'] || r['Customer'] || r['customer'] || '';
        
        tot += val;
        if (cat) {
            if (isAcc(cat)) accTot += val;
            else if (isHW(cat)) hwTot += val;`;
            
    const newLogic = `C.forEach(r => {
        let val = Number(r['Amount']||r['amount']||r['Collection']||0);
        let cat = r['Item Class Name'] || r['Item Group'] || r['category'] || r['Category'];
        let ah = r['acc - hw'] ? r['acc - hw'].toString().trim().toLowerCase() : '';
        let cName = r['Customer Name'] || r['Customer'] || r['customer'] || '';
        
        tot += val;
        if (ah.includes('acc')) {
            accTot += val;
        } else if (ah.includes('hw')) {
            hwTot += val;
        } else if (cat) {
            if (isAcc(cat)) accTot += val;
            else if (isHW(cat)) hwTot += val;`;

    content = content.replace(oldLogic, newLogic);

    if (content !== original) {
        fs.writeFileSync(p, content, 'utf-8');
        console.log('Updated ' + p);
    } else {
        console.log('No changes needed or could not find targets for ' + p);
    }
}
