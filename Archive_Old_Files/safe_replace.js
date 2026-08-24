const fs = require('fs');
let code = fs.readFileSync('index.html.restored3', 'utf8');

function replaceDatalabels(source) {
    let result = '';
    let i = 0;
    let count = 0;
    while (i < source.length) {
        let idx = source.indexOf('datalabels: {', i);
        if (idx === -1) {
            result += source.slice(i);
            break;
        }
        result += source.slice(i, idx);
        
        let start = idx + 'datalabels: '.length; // points to '{'
        let braces = 0;
        let j = start;
        for (; j < source.length; j++) {
            if (source[j] === '{') braces++;
            if (source[j] === '}') braces--;
            if (braces === 0 && j > start) {
                break;
            }
        }
        
        let newLabels = `{
                        color: '#fff',
                        font: { weight: 'bold', size: 14, family: 'Cairo' },
                        textStrokeColor: 'rgba(0,0,0,0.5)',
                        textStrokeWidth: 3,
                        display: function(ctx) {
                            let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                            let v = dataset.data[ctx.dataIndex];
                            if (!v || v <= 0) return false;
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
                    }`;
        result += 'datalabels: ' + newLabels;
        i = j + 1;
        count++;
    }
    console.log("Replaced datalabels occurrences:", count);
    return result;
}

code = replaceDatalabels(code);

// Let's also enforce cutout and padding universally.
code = code.replace(/cutout:\s*'[^']+'/g, "cutout: '45%'");
code = code.replace(/layout:\s*\{\s*padding:\s*\d+\s*\}/g, "layout: { padding: 15 }");

fs.writeFileSync('index.html', code, 'utf8');
console.log("Written to index.html");
