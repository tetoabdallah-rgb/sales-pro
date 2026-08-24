const fs = require('fs');
const path = require('path');
let appPath = path.join('e:/AI/apk/SalesProWeb', 'app.js');
let appContent = fs.readFileSync(appPath, 'utf-8');

if (!appContent.includes('Chart.register(ChartDataLabels)')) {
    appContent = appContent.replace('function rDash() {', 
        'Chart.register(ChartDataLabels);\n' +
        'Chart.defaults.plugins.datalabels = {\n' +
        '    color: "#fff",\n' +
        '    font: { weight: "bold", size: 10 },\n' +
        '    formatter: function(value) { return value > 0 ? (typeof aFmt !== "undefined" ? aFmt(value) : value) : ""; },\n' +
        '    display: function(context) { return context.dataset.data[context.dataIndex] > 0; }\n' +
        '};\n\nfunction rDash() {');
}

// Add tcCalc
if (!appContent.includes('let tc = 0;')) {
    appContent = appContent.replace('ds.forEach(r => { cu[r.Customer] = 1; or[r[\'Order Nbr\']] = 1; });',
        'ds.forEach(r => { cu[r.Customer] = 1; or[r[\'Order Nbr\']] = 1; });\n' +
        'let tc = 0;\n' +
        'if (typeof C !== "undefined" && C.length) {\n' +
        '    C.forEach(r => {\n' +
        '        tc += getRowVal(r, [\'Amount\', \'Collection\']);\n' +
        '    });\n' +
        '}\n');
}

// Add Collections UI
if (!appContent.includes("TUI('Collections')")) {
    appContent = appContent.replace('<div class="ki"><div class="lb"></div>',
        '<div class="ki"><div class="lb"></div><div class="vl"></div></div>\n' +
        '<div class="ki"><div class="lb"></div>');
}

fs.writeFileSync(appPath, appContent, 'utf-8');
console.log('Patched app.js with datalabels and collections');
