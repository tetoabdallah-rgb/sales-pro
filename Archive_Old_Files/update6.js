const fs = require('fs');
const path = require('path');

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

    // 1. DataLabels Plugin
    let s1 = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>';
    let s2 = '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>';
    if (content.includes(s1) && !content.includes(s2)) {
        content = content.replace(s1, s1 + '\\n' + s2);
    }

    // 2. Global Config
    let gc = 'Chart.register(ChartDataLabels);\\n' +
             'Chart.defaults.plugins.datalabels = {\\n' +
             '    color: "#fff",\\n' +
             '    font: { weight: "bold", size: 10 },\\n' +
             '    formatter: function(value) { return value > 0 ? (typeof aFmt !== "undefined" ? aFmt(value) : value) : ""; },\\n' +
             '    display: function(context) { return context.dataset.data[context.dataIndex] > 0; }\\n' +
             '};\\n\\n';
    let s3 = 'function rDash() {';
    if (!content.includes('Chart.register(ChartDataLabels);')) {
        content = content.replace(s3, gc + s3);
    }

    // 3. tc Calc
    let tcCalc = '\\n    let tc = 0;\\n' +
                 '    if (typeof C !== "undefined" && C.length) {\\n' +
                 '        C.forEach(r => {\\n' +
                 '            let keys = Object.keys(r);\\n' +
                 '            let getVal = (pn) => {\\n' +
                 '                let k = keys.find(k => pn.some(p => k.toLowerCase().replace(/\\\\s+/g, "") === p.toLowerCase().replace(/\\\\s+/g, "")));\\n' +
                 '                return k ? r[k] : undefined;\\n' +
                 '            };\\n' +
                 '            let rawVal = getVal(["Amount", "Collection"]) || 0;\\n' +
                 '            tc += Number(rawVal.toString().replace(/,/g, "")) || 0;\\n' +
                 '        });\\n' +
                 '    }\\n';
    let s4 = 'let cu = {}, or = {};\\n    ds.forEach(r => { cu[r.Customer] = 1; or[r[\\'Order Nbr\\']] = 1; });';
    if (!content.includes('let tc = 0;')) {
        content = content.replace(s4, s4 + tcCalc);
    }

    // 4. UI
    let s5 = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Sales\\'):\\'Sales\\'}</div><div class="vl">${aFmt(ts)}</div></div>';
    let newUI = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Collections\\'):\\'Collections\\'}</div><div class="vl">${typeof aFmt !== \\'undefined\\' ? aFmt(tc) : tc}</div></div>\\n            ' + s5;
    if (!content.includes("TUI('Collections')")) {
        content = content.replace(s5, newUI);
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', p);
}
