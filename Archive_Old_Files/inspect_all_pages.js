const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

let fns = [
    'rDash', 'rSales', 'rTgt', 'rPers', 'rCust', 'rBrands',
    'rAcc', 'rHw', 'rCol', 'rAna', 'rPot', 'rProf',
    'rKey', 'rDorm', 'rPros', 'rAI', 'rAlerts', 'rAccPage',
    'rBk', 'rSet', 'rRst', 'rStg'
];

fns.forEach(fn => {
    let idx = c.indexOf('function ' + fn);
    if (idx !== -1) {
        let h1Idx = c.indexOf('<h1', idx);
        if (h1Idx !== -1 && h1Idx - idx < 5000) {
            let endH1 = c.indexOf('</h1>', h1Idx) + 5;
            console.log(`${fn}: ${c.substring(h1Idx, endH1)}`);
        } else {
            console.log(`${fn}: no <h1> found near start`);
        }
    } else {
        console.log(`${fn}: function not found`);
    }
});
