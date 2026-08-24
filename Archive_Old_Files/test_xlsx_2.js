const XLSX = require('xlsx');
const wb = XLSX.readFile('e:/AI/apk/Sales Analysis New (2026-07-13).xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);
console.log(data.slice(0, 3));
