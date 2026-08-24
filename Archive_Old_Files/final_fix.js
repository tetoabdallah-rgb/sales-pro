const fs = require('fs');

let bundle = fs.readFileSync('e:/AI/apk/SalesProWeb/index_bundle.html', 'utf-8');

// 1. Add DataLabels
let s1 = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>';
let s2 = '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>';
if (bundle.includes(s1) && !bundle.includes(s2)) {
    bundle = bundle.replace(s1, s1 + '\\n' + s2);
}

// 2. Add Chart config
let gc = 'Chart.register(ChartDataLabels);\\n' +
         'Chart.defaults.plugins.datalabels = {\\n' +
         '    color: "#fff",\\n' +
         '    font: { weight: "bold", size: 10 },\\n' +
         '    formatter: function(value) { return value > 0 ? (typeof aFmt !== "undefined" ? aFmt(value) : value) : ""; },\\n' +
         '    display: function(context) { return context.dataset.data[context.dataIndex] > 0; }\\n' +
         '};\\n\\n';
let rDashSig = 'function rDash() {';
if (!bundle.includes('Chart.register(ChartDataLabels);')) {
    bundle = bundle.replace(rDashSig, gc + rDashSig);
}

// 3. tc Calc
let cuor = "    let cu = {}, or = {};\\n    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });";
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
if (bundle.includes(cuor)) {
    bundle = bundle.replace(cuor, cuor + tcCalc);
} else {
    // try with \r\n
    let cuor_win = "    let cu = {}, or = {};\\r\\n    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });";
    bundle = bundle.replace(cuor_win, cuor_win + tcCalc);
}

// 4. UI
let uisrc = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Sales\\'):\\'Sales\\'}</div><div class="vl">${aFmt(ts)}</div></div>';
let uiadd = '<div class="ki"><div class="lb">${L===\\'ar\\'?TUI(\\'Collections\\'):\\'Collections\\'}</div><div class="vl">${typeof aFmt !== \\'undefined\\' ? aFmt(tc) : tc}</div></div>\\n            ';
if (bundle.includes(uisrc) && !bundle.includes("TUI('Collections')")) {
    bundle = bundle.replace(uisrc, uiadd + uisrc);
}

fs.writeFileSync('e:/AI/apk/SalesProWeb/index.html', bundle, 'utf-8');
fs.writeFileSync('e:/AI/apk/SalesProWeb/index_bundle.html', bundle, 'utf-8');
fs.writeFileSync('e:/AI/apk/SalesProWeb/index_final.html', bundle, 'utf-8');
fs.writeFileSync('e:/AI/apk/SalesProWeb/index_github.html', bundle, 'utf-8');
fs.writeFileSync('e:/AI/apk/SalesProWeb/old_index.html', bundle, 'utf-8');

console.log('done fixing all files!');
