const fs = require('fs');
const path = require('path');

const p1 = fs.readFileSync('patch1.txt', 'utf-8');
const p2 = fs.readFileSync('patch2.txt', 'utf-8');
const p3 = fs.readFileSync('patch3.txt', 'utf-8');

const s1 = 'function rDash() {';
const s2 = "    let cu = {}, or = {};\\r\\n    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });";
const s2_lf = "    let cu = {}, or = {};\\n    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });";

const s3 = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Sales\\'):\\'Sales\\'}</div><div class="vl">${aFmt(ts)}</div></div>';

const files = [
    'index.html',
    'index_bundle.html',
    'index_final.html',
    'index_github.html',
    'old_index.html'
];

for (let file of files) {
    let p = path.join('e:/AI/apk/SalesProWeb', file);
    if (!fs.existsSync(p)) continue;
    
    let content = fs.readFileSync(p, 'utf-8');

    if (!content.includes('Chart.register(ChartDataLabels);')) {
        content = content.replace(s1, p1);
    }
    
    if (!content.includes('let tc = 0;')) {
        if (content.includes(s2)) content = content.replace(s2, p2);
        else if (content.includes(s2_lf)) content = content.replace(s2_lf, p2);
    }

    if (!content.includes("TUI('Collections')")) {
        content = content.replace(s3, p3);
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', file);
}
