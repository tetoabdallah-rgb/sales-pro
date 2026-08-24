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

let uiadd = `<div class="ki"><div class="lb">\${L==='ar'?TUI('Collections'):'Collections'}</div><div class="vl">\${typeof aFmt !== 'undefined' ? aFmt(tc) : tc}</div></div>\\n            `;

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
    let rDashIdx = content.indexOf('function rDash() {');
    if (rDashIdx !== -1 && !content.includes('Chart.register(ChartDataLabels);')) {
        content = content.substring(0, rDashIdx) + gc + content.substring(rDashIdx);
    }

    // 3. tcCalc
    if (!content.includes('let tc = 0;')) {
        let forEachIdx = content.indexOf('ds.forEach(r => { cu[r.Customer] = 1; or[r[\\'Order Nbr\\']] = 1; });');
        if (forEachIdx !== -1) {
            let endOfLine = content.indexOf('\\n', forEachIdx) + 1;
            content = content.substring(0, endOfLine) + tcCalc + content.substring(endOfLine);
        }
    }

    // 4. UI addition
    if (!content.includes("TUI('Collections')")) {
        let salesIdx = content.indexOf('<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Sales\\'):\\'Sales\\'}</div>');
        if (salesIdx !== -1) {
            content = content.substring(0, salesIdx) + uiadd + content.substring(salesIdx);
        }
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', file);
}
