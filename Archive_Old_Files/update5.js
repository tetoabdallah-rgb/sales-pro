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

    // 1. Add DataLabels script
    let chartjsTag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>';
    let datalabelsTag = '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>';
    if (content.indexOf(chartjsTag) !== -1 && content.indexOf(datalabelsTag) === -1) {
        content = content.replace(chartjsTag, chartjsTag + "\\n" + datalabelsTag);
    }

    // 2. Add ChartDataLabels registration and formatting globally
    let globalConfig = "Chart.register(ChartDataLabels);\\n" +
"Chart.defaults.plugins.datalabels = {\\n" +
"    color: '#fff',\\n" +
"    font: { weight: 'bold', size: 10 },\\n" +
"    formatter: function(value) { return value > 0 ? (typeof aFmt !== 'undefined' ? aFmt(value) : value) : ''; },\\n" +
"    display: function(context) { return context.dataset.data[context.dataIndex] > 0; }\\n" +
"};";
    
    if (content.indexOf('Chart.register(ChartDataLabels);') === -1) {
        let scIdx = content.indexOf('function rDash()');
        if (scIdx !== -1) {
            content = content.substring(0, scIdx) + globalConfig + "\\n\\n" + content.substring(scIdx);
        }
    }

    // 3. Add Collections to Dashboard summary
    let rDashMatch = content.indexOf('function rDash()');
    if (rDashMatch !== -1) {
        if (content.indexOf('let tc = 0;') === -1) {
            let dsForeach = content.indexOf('let ds = getFilteredSales();', rDashMatch);
            if (dsForeach !== -1) {
                let endOfVars = content.indexOf('let cu = {}, or = {};', dsForeach);
                if (endOfVars !== -1) {
                    let calcTc = "\\n    let tc = 0;\\n" +
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
                    content = content.substring(0, endOfVars) + calcTc + content.substring(endOfVars);
                }
            }
        }

        let searchStr = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Sales\\'):\\'Sales\\'}</div>';
        let kiMatch = content.indexOf(searchStr, rDashMatch);
        if (kiMatch !== -1 && content.indexOf("TUI('Collections')") === -1) {
            let newKi = "<div class=\\"ki\\"><div class=\\"lb\\">${L==='ar'?TUI('Collections'):'Collections'}</div><div class=\\"vl\\">${typeof aFmt !== 'undefined' ? aFmt(tc) : tc}</div></div>\\n            ";
            content = content.substring(0, kiMatch) + newKi + content.substring(kiMatch);
        }
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', p);
}
