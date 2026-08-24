const fs = require('fs');
let file = 'e:/AI/apk/SalesProWeb/ui-components.js';
let content = fs.readFileSync(file, 'utf-8');

// In rCollections: replace the manual Payment Ref detection with getPayRef
let old = `        let rawVal = getVal(['Amount', 'Collection']) || 0;
        let val = Number(rawVal.toString().replace(/,/g, '')) || 0;
        let cat = getVal(['Item Class Name', 'Item Group', 'Category']);
        let ahRaw = getVal(['acc-hw', 'acchw', 'acc - hw']);
        let ah = ahRaw ? ahRaw.toString().trim().toLowerCase() : '';
        let cName = getVal(['Customer Name', 'Customer']) || '';
        
        tot += val;
          // Payment Ref. column takes priority: acc=accessories, hw=hardware
          let payRef = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();
          if (payRef.startsWith('acc')) {
              accTot += val;
          } else if (payRef.startsWith('hw')) {
              hwTot += val;
          } else if (ah.includes('acc') || ah.includes('???????')) {
              accTot += val;
          } else if (ah.includes('hw') || ah.includes('???????') || ah.includes('????')) {
              hwTot += val;`;

let newCode = `        let val = getPayVal(r);
        let cat = getVal(['Item Class Name', 'Item Group', 'Category']);
        let cName = getVal(['Customer Name', 'Customer']) || '';
        
        tot += val;
          let payRef = getPayRef(r);
          if (payRef === 'acc') {
              accTot += val;
          } else if (payRef === 'hw') {
              hwTot += val;
          } else if (cat && isAcc(cat)) {
              accTot += val;
          } else if (cat && isHW(cat)) {
              hwTot += val;`;

if (content.includes(old)) {
    content = content.replace(old, newCode);
    console.log('rCollections patched cleanly');
} else {
    console.log('Pattern not found - checking...');
    let idx = content.indexOf("getPayRef");
    console.log('getPayRef already at:', idx);
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Done');
