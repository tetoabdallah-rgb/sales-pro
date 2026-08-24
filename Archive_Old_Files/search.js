const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('محتملين') || l.includes('Leads')) {
        console.log((i+1) + ': ' + l.trim());
    }
});
