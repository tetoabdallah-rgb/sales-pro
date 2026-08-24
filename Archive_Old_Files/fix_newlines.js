const fs = require('fs');
let files = ['ui-components.js', 'index.html', 'index_bundle.html', 'live.html'];

for (let file of files) {
    if (!fs.existsSync(file)) continue;
    let c = fs.readFileSync(file, 'utf8');
    
    // Replace literal \n\n with actual newlines
    let modified = false;
    if (c.includes('\\n\\n    // Charts')) {
        c = c.replace(/\\n\\n    \/\/ Charts/g, '\n\n    // Charts');
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(file, c);
        console.log('Fixed literal newlines in ' + file);
    }
}
