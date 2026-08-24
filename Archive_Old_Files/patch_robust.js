const fs = require('fs');
const path = require('path');

let files = ['app.js', 'ui-components.js'];

for (let file of files) {
    let p = path.join('e:/AI/apk/SalesProWeb', file);
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf-8');

    // Replace Sales After Discount
    content = content.replace(/Number\(r\['Sales After Discount'\]\)\|\|0/g, "getRowVal(r, ['Sales After Discount', 'Sales', 'Amount'])");
    
    // Replace Profit Margin
    content = content.replace(/Number\(r\['Profit Margin'\]\)\|\|0/g, "getRowVal(r, ['Profit Margin', 'Profit'])");

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Patched', file);
}
