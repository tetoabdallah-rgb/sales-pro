const fs = require('fs');
const glob = require('fs').readdirSync('.');

const htmlFiles = glob.filter(f => f.endsWith('.html'));

const configBlock = `
<script>
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    Chart.defaults.set('plugins.datalabels', {
        color: '#fff',
        font: {
            weight: 'bold',
            size: 10
        },
        formatter: function(value, context) {
            if (value === 0) return '';
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
        },
        display: function(context) {
            let val = context.dataset.data[context.dataIndex];
            if (val <= 0) return false;
            let type = context.chart.config.type;
            if (type === 'doughnut' || type === 'pie') {
                let meta = context.chart.getDatasetMeta(context.datasetIndex);
                if (meta && meta.total > 0) {
                    if ((val / meta.total) < 0.04) return false;
                }
            }
            return 'auto';
        },
        anchor: function(context) {
            let type = context.chart.config.type;
            if (type === 'bar' || type === 'line') return 'end';
            return 'center';
        },
        align: function(context) {
            let type = context.chart.config.type;
            if (type === 'bar') return 'end';
            if (type === 'line') return 'top';
            return 'center';
        },
        offset: function(context) {
            let type = context.chart.config.type;
            return (type === 'bar' || type === 'line') ? 4 : 0;
        },
        clamp: true
    });
}
</script>
`;

let patched = 0;

for (let file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if the old block is there
    if (content.includes('Chart.defaults.set(\'plugins.datalabels\'')) {
        // We already have a block, we need to replace it.
        let regex = /<script>\s*(?:window\.addEventListener\('load', function\(\) \{\s*)?if \(typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined'\) \{[\s\S]*?Chart\.defaults\.set\('plugins\.datalabels'[\s\S]*?(?:\}\);\s*\})?\s*\}?\s*<\/script>/g;
        if (regex.test(content)) {
            content = content.replace(regex, configBlock.trim());
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Patched existing block in ${file}`);
            patched++;
        } else {
            console.log(`Regex did not match in ${file} despite finding the string.`);
        }
    } else {
        // Inject after the script tag
        let scriptTag = '<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>';
        if (content.includes(scriptTag)) {
            content = content.replace(scriptTag, scriptTag + '\n' + configBlock.trim());
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Injected new block in ${file}`);
            patched++;
        }
    }
}

console.log(`Done. Patched ${patched} files.`);
