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

let uiadd = fs.readFileSync('uiadd.txt', 'utf-8');

for (let file of files) {
    let p = path.join('e:/AI/apk/SalesProWeb', file);
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf-8');

    // 1. DataLabels script tag
    let chartjsTag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>';
    let datalabelsTag = '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>';
    if (content.indexOf(chartjsTag) !== -1 && content.indexOf(datalabelsTag) === -1) {
        content = content.replace(chartjsTag, chartjsTag + '\\n' + datalabelsTag);
    }

    // 2. Chart global config
    let s2 = 'function rDash() {';
    if (content.indexOf(s2) !== -1 && content.indexOf('Chart.register(ChartDataLabels);') === -1) {
        content = content.replace(s2, gc + s2);
    }

    // 3. tcCalc
    let s3 = Buffer.from('ICAgIGxldCBjdSA9IHt9LCBvciA9IHt9Ow0KICAgIGRzLmZvckVhY2gociA9PiB7IGN1W3JbJ0N1c3RvbWVyJ11dID0gMTsgb3JbclsnT3JkZXIgTmJyJ11dID0gMTsgfSk7', 'base64').toString('utf-8'); // Windows \r\n
    let s3_lf = Buffer.from('ICAgIGxldCBjdSA9IHt9LCBvciA9IHt9OwogICAgZHMuZm9yRWFjaChyID0+IHsgY3VbclsnQ3VzdG9tZXInXV0gPSAxOyBvcltyWydPcmRlciBOYnInXV0gPSAxOyB9KTs=', 'base64').toString('utf-8'); // Unix \n

    if (content.indexOf('let tc = 0;') === -1) {
        if (content.indexOf(s3) !== -1) {
            content = content.replace(s3, s3 + tcCalc);
        } else if (content.indexOf(s3_lf) !== -1) {
            content = content.replace(s3_lf, s3_lf + tcCalc);
        }
    }

    // 4. UI addition
    let s4 = Buffer.from('PGRpdiBjbGFzcz0ia2kiPjxkaXYgY2xhc3M9ImxiIj4ke0w9PT0nYXInP1RVSSgnU2FsZXMnKTonU2FsZXMnfTwvZGl2PjxkaXYgY2xhc3M9InZsIj4ke2FGbXQodHMpfTwvZGl2PjwvZGl2Pg==', 'base64').toString('utf-8');
    if (content.indexOf(s4) !== -1 ) {
        content = content.replace(s4, uiadd + s4);
    }

    fs.writeFileSync(p, content, 'utf-8');
    console.log('Updated', file);
}
