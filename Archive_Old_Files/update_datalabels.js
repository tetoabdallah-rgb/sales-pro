const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

const newLabels = `datalabels: {
    color: '#fff',
    font: { weight: 'bold', size: 10, family: 'Cairo' },
    display: function(ctx) {
        let v = ctx.dataset.data[ctx.dataIndex];
        return v > 0 ? 'auto' : false;
    },
    formatter: function(v) {
        if (!v || v === 0) return '';
        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
        return v;
    }
}`;

code = code.replace(/datalabels:\s*\{\s*display:\s*false\s*\}/g, newLabels);

fs.writeFileSync('new_features.js', code, 'utf8');
console.log("Datalabels updated!");
