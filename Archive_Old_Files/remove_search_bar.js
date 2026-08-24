const fs = require('fs');

function removeSearch(file) {
    if (!fs.existsSync(file)) return;
    let c = fs.readFileSync(file, 'utf8');
    
    // Match the search bar comment and div container until <main class="mw"
    let regex = /\s*<!--\s*Global Search Bar[\s\S]*?z-index:\s*1000;\s*padding:\s*10px;\s*">\s*<\/div>\s*<\/div>/i;
    if (regex.test(c)) {
        c = c.replace(regex, '');
        console.log(`Removed Global Search Bar from ${file}. New length: ${c.length}`);
    } else {
        // Let's try simpler replacement if regex didn't match
        let start = c.indexOf('<!-- Global Search Bar');
        if (start !== -1) {
            let end = c.indexOf('<main class="mw"', start);
            if (end !== -1) {
                c = c.substring(0, start) + '\n  ' + c.substring(end);
                console.log(`Removed Global Search Bar via index from ${file}. New length: ${c.length}`);
            }
        } else {
            console.log(`Search bar not found in ${file}`);
        }
    }
    fs.writeFileSync(file, c);
}

removeSearch('index.html');
removeSearch('index_restored.html');
