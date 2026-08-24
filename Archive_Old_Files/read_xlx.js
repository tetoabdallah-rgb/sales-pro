const XLSX = require('xlsx');
const path = require('path');

// Read All Payment
const wb1 = XLSX.readFile('e:/AI/apk/xlx/All Payment (2026-07-20).xlsx');
console.log('=== All Payment Sheets:', wb1.SheetNames);
wb1.SheetNames.forEach(name => {
    const data = XLSX.utils.sheet_to_json(wb1.Sheets[name]);
    console.log('Sheet:', name);
    console.log('Columns:', Object.keys(data[0] || {}));
    console.log('Row 1:', JSON.stringify(data[0]));
    console.log('Row 2:', JSON.stringify(data[1]));
    console.log('---');
});

// Read Sales Analysis
const wb2 = XLSX.readFile('e:/AI/apk/xlx/Sales Analysis New (2026-07-20).xlsx');
console.log('\n=== Sales Analysis Sheets:', wb2.SheetNames);
wb2.SheetNames.forEach(name => {
    const data = XLSX.utils.sheet_to_json(wb2.Sheets[name]);
    console.log('Sheet:', name);
    console.log('Columns:', Object.keys(data[0] || {}));
    console.log('Row 1:', JSON.stringify(data[0]));
    console.log('---');
});

// Read target
const wb3 = XLSX.readFile('e:/AI/apk/xlx/target-template.xlsx');
console.log('\n=== Target Sheets:', wb3.SheetNames);
wb3.SheetNames.forEach(name => {
    const data = XLSX.utils.sheet_to_json(wb3.Sheets[name]);
    console.log('Sheet:', name);
    console.log('Columns:', Object.keys(data[0] || {}));
    console.log('Row 1:', JSON.stringify(data[0]));
    console.log('---');
});
