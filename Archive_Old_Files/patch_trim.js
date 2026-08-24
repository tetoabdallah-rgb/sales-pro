const fs = require('fs');

let files = ['index.html', 'index_bundle.html', 'index_final.html', 'index_github.html', 'old_index.html'];

files.forEach(file => {
    try {
        let f = fs.readFileSync('e:/AI/apk/SalesProWeb/' + file, 'utf8');
        let target = 'cb(XLSX.utils.sheet_to_json(ws));';
        let repl = 'let j = XLSX.utils.sheet_to_json(ws);\\n                cb(j.map(r=>{let n={};for(let k in r)n[k.trim()]=r[k];return n;}));';
        
        if (f.includes(target)) {
            f = f.split(target).join(repl);
            fs.writeFileSync('e:/AI/apk/SalesProWeb/' + file, f, 'utf8');
            console.log('Patched', file);
        }
    } catch(e) {}
});
