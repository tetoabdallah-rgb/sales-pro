const fs = require('fs');
let files = ['ui-components.js', 'index.html', 'index_bundle.html', 'live.html'];

for (let file of files) {
    if (!fs.existsSync(file)) continue;
    let c = fs.readFileSync(file, 'utf8');
    
    let modified = false;
    let oldStr = "<div class=\\"rg\\">${ring(L==='ar'?TUI('Sales'):'Sales', ap, tt)}${ring(L==='ar'?TUI('Profit'):'Profit', pp, tpt)}</div>";
    let newStr = "<div class=\\"rg\\">${ring(L==='ar'?TUI('Sales'):'Sales', ap, ts)}${ring(L==='ar'?TUI('Profit'):'Profit', pp, tp)}</div>";
    
    // Fallback: replace using split/join to avoid regex syntax errors with all the special chars
    if (c.includes(oldStr)) {
        c = c.split(oldStr).join(newStr);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(file, c);
        console.log('Fixed ring targets in ' + file);
    }
}
