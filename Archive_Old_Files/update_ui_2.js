const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

// 1. Completely REMOVE the sp-bg background injection.
// The user doesn't want the background interfering at all.
let bgRegex = /let bg = document\.createElement\('div'\);\s*bg\.id = 'sp-bg';[\s\S]*?\}\);\s*\n/m;
if (code.match(bgRegex)) {
    code = code.replace(bgRegex, "");
    console.log("Background injection removed completely.");
} else {
    console.log("Background injection not found.");
}

// 2. Fix Datalabels overlapping and font size
// Find the labelConf object and replace it.
let labelRegex = /let labelConf = \{[\s\S]*?formatter: function\(v\)\s*\{[\s\S]*?\}\s*\};/m;
let newLabelConf = `let labelConf = {
            color: '#fff',
            font: { weight: 'bold', size: 14, family: 'Cairo' },
            textStrokeColor: 'rgba(0,0,0,0.5)',
            textStrokeWidth: 3,
            display: function(ctx) {
                let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                let v = dataset.data[ctx.dataIndex];
                if (!v || v <= 0) return false;
                
                // If it's a pie/doughnut chart, hide labels for slices < 5% to prevent overlap
                if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                    let total = dataset.data.reduce((a, b) => a + b, 0);
                    if ((v / total) < 0.05) return false;
                }
                return 'auto';
            },
            formatter: function(v) {
                if (!v || v === 0) return '';
                if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                return v;
            }
        };`;

if (code.match(labelRegex)) {
    code = code.replace(labelRegex, newLabelConf);
    console.log("Datalabels configuration updated.");
} else {
    console.log("Datalabels configuration not found.");
}

fs.writeFileSync('new_features.js', code, 'utf8');
console.log("UI updated again!");
