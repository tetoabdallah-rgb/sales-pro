const fs = require('fs');

let file = 'ui-components.js';
let content = fs.readFileSync(file, 'utf8');

// The datalabels plugin configuration to inject into options.plugins
const dlConfig = `datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(v) {
                        if (v === 0) return '';
                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                        return v;
                    },
                    display: function(ctx) {
                        let val = ctx.dataset.data[ctx.dataIndex];
                        if (val <= 0) return false;
                        let type = ctx.chart.config.type;
                        if (type === 'doughnut' || type === 'pie') {
                            let meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                            if (meta && meta.total > 0 && (val / meta.total) < 0.04) return false;
                        }
                        return 'auto';
                    },
                    anchor: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 'end' : 'center'; },
                    align: function(ctx) { return ctx.chart.config.type === 'bar' ? 'end' : (ctx.chart.config.type === 'line' ? 'top' : 'center'); },
                    offset: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 4 : 0; },
                    clamp: true
                }`;

let files = fs.readdirSync('.').filter(f => f.endsWith('.js') || f.endsWith('.html'));

for (let file of files) {
    if (file === 'patch_datalabels_all.js' || file === 'patch_charts.js') continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. CH.d (bar chart)
    content = content.replace(
        /options:\{responsive:true,\s*maintainAspectRatio:false,\s*plugins:\{legend:\{display:false\}\}\}/g,
        `options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, ${dlConfig}}}`
    );

    // 2. CH.c (doughnut)
    content = content.replace(
        /options:\{responsive:true,\s*maintainAspectRatio:false,\s*plugins:\{legend:\{position:'bottom',\s*labels:\{font:\{size:8\}\}\}\}\}/g,
        `options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:8}}}, ${dlConfig}}}`
    );

    // 3. CH.anM (line)
    content = content.replace(
        /options:\{responsive:true,maintainAspectRatio:false,plugins:\{legend:\{position:'top'\}\}\}/g,
        `options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}, ${dlConfig}}}`
    );

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(file + ' patched!');
    }
}
