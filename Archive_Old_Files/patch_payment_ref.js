const fs = require('fs');

let file = 'e:/AI/apk/SalesProWeb/ui-components.js';
let content = fs.readFileSync(file, 'utf-8');

// Find rCollections and replace the acc/hw calculation section
// The current code uses accTot_s from Sales - we need to replace it to use C (Payment sheet)
// with Payment Ref. column (acc/hw)

let oldTop = `function rCollections() {
\r\n    // Read Accessories/Hardware from Sales sheet (not from Collections)\r\n    let _accList2 = (accCats && accCats.length) ? accCats : DEF_ACC;\r\n    let _hwList2  = (hwCats  && hwCats.length)  ? hwCats  : DEF_HW;\r\n    let accTot_s = 0, hwTot_s = 0;\r\n    S.forEach(function(s) {\r\n        let v = getRowVal(s, ['Sales After Discount', 'Sales']);\r\n        if (_accList2.includes(s['Item Class Name'])) accTot_s += v;\r\n        if (_hwList2.includes(s['Item Class Name']))  hwTot_s  += v;\r\n    });`;

let newTop = `function rCollections() {
\r\n    // Read acc/hw from Payment sheet using "Payment Ref." column (acc = accessories, hw = hardware)\r\n    let accTot_s = 0, hwTot_s = 0, tot_all = 0;\r\n    C.forEach(function(r) {\r\n        let amt = getRowVal(r, ['Amount', 'Collection']);\r\n        let ref = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();\r\n        tot_all += amt;\r\n        if (ref === 'acc' || ref.includes('acc')) accTot_s += amt;\r\n        else if (ref === 'hw' || ref.includes('hw')) hwTot_s += amt;\r\n    });`;

if (content.includes(oldTop)) {
    content = content.replace(oldTop, newTop);
    console.log('TOP section replaced OK');
} else {
    // Try with just the injected section
    let idx = content.indexOf('function rCollections()');
    if (idx !== -1) {
        let bodyStart = content.indexOf('{', idx) + 1;
        // Find end of injected block (up to "let tot = 0")
        let endInject = content.indexOf('let tot = 0', bodyStart);
        if (endInject !== -1) {
            let inject = `
\r\n    // Read acc/hw from Payment sheet using "Payment Ref." column\r\n    let accTot_s = 0, hwTot_s = 0, tot_all = 0;\r\n    C.forEach(function(r) {\r\n        let amt = getRowVal(r, ['Amount', 'Collection']);\r\n        let ref = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();\r\n        tot_all += amt;\r\n        if (ref === 'acc' || ref.includes('acc')) accTot_s += amt;\r\n        else if (ref === 'hw' || ref.includes('hw')) hwTot_s += amt;\r\n    });`;
            let before = content.substring(0, bodyStart);
            let after = content.substring(endInject);
            content = before + inject + '\r\n' + after;
            console.log('TOP injected at idx', bodyStart);
        }
    }
}

// Also update the total (tot) to use tot_all from C if available
// Replace ${aFmt(tot)} in collections with ${aFmt(tot_all || tot)}
content = content.replace(
    "${L==='ar'?TUI('Total Collections'):'Total Collections'}</div><div class=\"vl\">${aFmt(tot)}</div>",
    "${L==='ar'?TUI('Total Collections'):'Total Collections'}</div><div class=\"vl\">${aFmt(tot_all || tot)}</div>"
);
console.log('Total display updated');

fs.writeFileSync(file, content, 'utf-8');
console.log('Done!');
