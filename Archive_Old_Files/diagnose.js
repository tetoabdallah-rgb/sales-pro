const fs = require('fs');
const vm = require('vm');
const https = require('https');

function checkFile(filename, content) {
    console.log(`\n========================================`);
    console.log(`Checking: ${filename} (Size: ${content.length} bytes)`);
    let regex = /<script.*?>([\s\S]*?)<\/script>/gi;
    let match;
    let i = 0;
    let errors = 0;
    while ((match = regex.exec(content)) !== null) {
        i++;
        let js = match[1];
        let tag = match[0].split('>')[0] + '>';
        if (tag.includes('src=')) {
            console.log(`  Script #${i}: External -> ${tag}`);
            continue;
        }
        if (!js.trim()) {
            console.log(`  Script #${i}: Empty`);
            continue;
        }
        try {
            new vm.Script(js);
            let firstLine = js.trim().split('\n')[0].slice(0, 50);
            console.log(`  Script #${i}: OK (${js.length} bytes) - "${firstLine}"`);
        } catch (e) {
            errors++;
            console.log(`  Script #${i}: SYNTAX ERROR! (${js.length} bytes)`);
            console.log(`  Error: ${e.message}`);
            console.log(e.stack.split('\n').slice(0, 4).join('\n'));
        }
    }
    console.log(`Total script tags: ${i}, Syntax Errors: ${errors}`);
}

['index.html', 'index_bundle.html', 'index_final.html', 'index_github.html'].forEach(file => {
    if (fs.existsSync(file)) {
        checkFile(file, fs.readFileSync(file, 'utf8'));
    } else {
        console.log(`File not found: ${file}`);
    }
});

console.log(`\nFetching live website https://tetoabdallah-rgb.github.io/sales-pro/index.html ...`);
https.get('https://tetoabdallah-rgb.github.io/sales-pro/index.html', (res) => {
    let data = '';
    console.log(`Live Status Code: ${res.statusCode}`);
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        checkFile('LIVE GITHUB PAGES (index.html)', data);
    });
}).on('error', err => {
    console.error('Failed to fetch live website:', err.message);
});
