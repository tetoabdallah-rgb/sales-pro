const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldCheck1 = `let sList = typeof window.S !== 'undefined' ? window.S : [];`;
const newCheck1 = `let sList = typeof S !== 'undefined' ? S : JSON.parse(localStorage.getItem('salesData')||'[]');`;

const oldCheck2 = `let cList = typeof window.C !== 'undefined' ? window.C : [];`;
const newCheck2 = `let cList = typeof C !== 'undefined' ? C : JSON.parse(localStorage.getItem('payData')||'[]');`;

code = code.replace(oldCheck1, newCheck1).replace(oldCheck2, newCheck2);

fs.writeFileSync('index.html', code, 'utf8');
console.log('Fixed auto send logic in index.html');
