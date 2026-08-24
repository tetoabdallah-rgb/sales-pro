const fs = require('fs');

function fixFile(file) {
    let content = fs.readFileSync(file);
    // Remove BOM if present at start
    if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
        content = content.slice(3);
    }
    let str = content.toString('utf8');
    // Remove inline BOMs that might have been injected
    str = str.replace(/\uFEFF/g, '');
    
    // Now let's just restore from git to be absolutely clean
    // wait, I don't want to lose my kanban and font fixes.
    fs.writeFileSync(file, str, 'utf8');
}

fixFile('e:/AI/apk/SalesProWeb/index.html');
fixFile('e:/AI/apk/SalesProWeb/ui-components.js');
console.log('Fixed BOMs');
