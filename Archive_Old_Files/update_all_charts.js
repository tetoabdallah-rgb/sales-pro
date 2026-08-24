const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The new config we want to inject for datalabels
let newLabels = `datalabels: {
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

// Replace all existing datalabels: { ... } in index.html with the new one.
// We have to be careful with the regex to match the whole datalabels block.
// In index.html, the datalabels block ends with "return false;\n                              }\n                          }\n                      }" or similar.
// It's safer to just replace everything between `datalabels: {` and `}` that ends the plugin object. Wait, it's easier to find `datalabels: {` and replace up to `}`? No, there are nested `{}`.

// Let's use a simpler regex that matches the exact block we found in index.html.
let oldLabelRegex = /datalabels:\s*\{\s*color:\s*'#fff',\s*font:\s*\{\s*weight:\s*'bold',\s*size:\s*10\s*\}[\s\S]*?(?:return\s*false;\s*\}\s*|\s*\}\s*\n)\s*\}/g;

code = code.replace(oldLabelRegex, newLabels);

// Now, update doughnut options to have cutout: '45%' and layout: { padding: 15 }
// Find: options:{responsive:true, maintainAspectRatio:false, plugins:
// Replace with: options:{responsive:true, maintainAspectRatio:false, cutout:'45%', layout:{padding:15}, plugins:
code = code.replace(/options:\{responsive:true,\s*maintainAspectRatio:false,\s*plugins:/g, "options:{responsive:true, maintainAspectRatio:false, cutout:'45%', layout:{padding:15}, plugins:");

fs.writeFileSync('index.html', code, 'utf8');
console.log("index.html charts updated.");
