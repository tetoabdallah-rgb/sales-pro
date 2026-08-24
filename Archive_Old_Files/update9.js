const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'index_bundle.html',
    'index_final.html',
    'index_github.html',
    'old_index.html'
];

let s1 = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>';
let s2 = '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>';

for (let file of files) {
    let p = path.join('e:/AI/apk/SalesProWeb', file);
    if (!fs.existsSync(p)) continue;
    
    let content = fs.readFileSync(p, 'utf-8');

    if (content.includes(s1) && !content.includes(s2)) {
        content = content.replace(s1, s1 + '\\n' + s2);
        fs.writeFileSync(p, content, 'utf-8');
        console.log('Added script to', file);
    }
}
