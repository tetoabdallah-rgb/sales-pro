const fs = require('fs');
const path = require('path');

const p1 = fs.readFileSync('patch1.txt', 'utf-8');
const p2 = fs.readFileSync('patch2.txt', 'utf-8');
const p3 = fs.readFileSync('patch3.txt', 'utf-8');

const s1 = fs.readFileSync('search1.txt', 'utf-8');
const s2 = fs.readFileSync('search2.txt', 'utf-8');
const s3 = fs.readFileSync('search3.txt', 'utf-8');

const s2_lf = s2.replace(/\\r\\n/g, '\\n');

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
        content = content.replace(s1, p1 + '\\n\\n' + s1);
    }
    
    if (!content.includes('let tc = 0;')) {
        if (content.includes(s2)) content = content.replace(s2, s2 + '\\n' + p2);
        else if (content.includes(s2_lf)) content = content.replace(s2_lf, s2_lf + '\\n' + p2);
    }

    if (!content.includes("TUI('Collections')")) {
        let replacement3 = p3 + '\\n            ' + s3;
        content = content.replace(s3, replacement3);
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', file);
}
