const XLSX = require('xlsx');
const wb = XLSX.readFile('e:/AI/apk/All Payment (2026-07-14).xlsx');
console.log('Sheets:', wb.SheetNames);
wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws);
    console.log('--- Sheet:', name, '---');
    console.log('Columns:', Object.keys(data[0] || {}));
    console.log('First 3 rows:', JSON.stringify(data.slice(0, 3), null, 2));
});
