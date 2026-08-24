const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'index_bundle.html',
    'index_final.html',
    'index_github.html',
    'old_index.html'
];

let gc = 'Chart.register(ChartDataLabels);\\n' +
         'Chart.defaults.plugins.datalabels = {\\n' +
         '    color: "#fff",\\n' +
         '    font: { weight: "bold", size: 10 },\\n' +
         '    formatter: function(value) { return value > 0 ? (typeof aFmt !== "undefined" ? aFmt(value) : value) : ""; },\\n' +
         '    display: function(context) { return context.dataset.data[context.dataIndex] > 0; }\\n' +
         '};\\n\\n';
         
let tcCalc = "\\n    let tc = 0;\\n" +
             "    if (typeof C !== 'undefined' && C.length) {\\n" +
             "        C.forEach(r => {\\n" +
             "            let keys = Object.keys(r);\\n" +
             "            let getVal = (pn) => {\\n" +
             "                let k = keys.find(k => pn.some(p => k.toLowerCase().replace(/\\\\s+/g, '') === p.toLowerCase().replace(/\\\\s+/g, '')));\\n" +
             "                return k ? r[k] : undefined;\\n" +
             "            };\\n" +
             "            let rawVal = getVal(['Amount', 'Collection']) || 0;\\n" +
             "            tc += Number(rawVal.toString().replace(/,/g, '')) || 0;\\n" +
             "        });\\n" +
             "    }\\n";

for (let file of files) {
    let p = path.join('e:/AI/apk/SalesProWeb', file);
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf-8');

    // 1. DataLabels script tag
    let chartjsTag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>';
    let datalabelsTag = '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>';
    if (content.includes(chartjsTag) && !content.includes(datalabelsTag)) {
        content = content.replace(chartjsTag, chartjsTag + '\\n' + datalabelsTag);
    }

    // 2. Chart global config
    content = content.replace('// 1. Dashboard\\nfunction rDash() {', '// 1. Dashboard\\n' + gc + 'function rDash() {');
    content = content.replace('// 1. Dashboard\\r\\nfunction rDash() {', '// 1. Dashboard\\r\\n' + gc + 'function rDash() {');

    // 3. tcCalc
    let cuor = "    let cu = {}, or = {};\\n    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });";
    let cuor_win = "    let cu = {}, or = {};\\r\\n    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });";
    if (!content.includes('let tc = 0;')) {
        content = content.replace(cuor, cuor + tcCalc);
        content = content.replace(cuor_win, cuor_win + tcCalc);
    }

    // 4. UI addition
    let sStr = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Sales\\'):\\'Sales\\'}</div>';
    let uiadd = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Collections\\'):\\'Collections\\'}</div><div class="vl">${typeof aFmt !== \\'undefined\\' ? aFmt(tc) : tc}</div></div>\\n            ';
    if (!content.includes("TUI('Collections')")) {
        content = content.replace(sStr, uiadd + sStr);
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', file);
}
