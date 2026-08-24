const fs = require('fs');
let file = 'e:/AI/apk/SalesProWeb/app.js';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/getRowVal\(r, \['Sales After Discount', 'Sales', 'Amount'\]\)/g, 'getSalesVal(r)');
content = content.replace(/getRowVal\(r, \['Sales After Discount', 'Sales'\]\)/g, 'getSalesVal(r)');
content = content.replace(/getRowVal\(r, \['Profit Margin', 'Profit'\]\)/g, 'getProfitVal(r)');
fs.writeFileSync(file, content, 'utf-8');
console.log('app.js updated');
