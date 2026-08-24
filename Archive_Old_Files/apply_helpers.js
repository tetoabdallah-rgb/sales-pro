const fs = require('fs');

let file = 'e:/AI/apk/SalesProWeb/ui-components.js';
let content = fs.readFileSync(file, 'utf-8');

// Replace all getRowVal calls for sales with getSalesVal
let before = content.length;
content = content.replace(/getRowVal\(r, \['Sales After Discount', 'Sales', 'Amount'\]\)/g, 'getSalesVal(r)');
content = content.replace(/getRowVal\(r, \['Sales After Discount', 'Sales'\]\)/g, 'getSalesVal(r)');
content = content.replace(/getRowVal\(s, \['Sales After Discount', 'Sales'\]\)/g, 'getSalesVal(s)');
content = content.replace(/getRowVal\(r, \['Profit Margin', 'Profit'\]\)/g, 'getProfitVal(r)');
content = content.replace(/getRowVal\(r, \['Amount', 'Collection'\]\)/g, 'getPayVal(r)');
content = content.replace(/getRowVal\(s, \['Amount', 'Collection'\]\)/g, 'getPayVal(s)');

// Also replace in rCollections: Payment Ref logic - use getPayRef
let after = content.length;
console.log('Replacements done. Size change:', after - before);

fs.writeFileSync(file, content, 'utf-8');
console.log('ui-components.js updated');
