const fs = require('fs');
const path = require('path');
const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.css'));
files.forEach(f => {
    try {
        const lines = fs.readFileSync(f, 'utf8').split('\n');
        lines.forEach((l, i) => {
            if (l.includes('محتملين (Leads)')) {
                console.log(f + ':' + (i+1) + ': ' + l.trim());
            }
        });
    } catch(e) {}
});
