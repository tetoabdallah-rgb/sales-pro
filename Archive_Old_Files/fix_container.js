const fs = require('fs');

function fixContainer(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix container wrapper to wrap buttons and look nice
    content = content.replace(/<div style="display:flex; gap:5px;">(\s*<button onclick="waLead)/g, '<div style="display:flex; gap:5px; flex-wrap:wrap; justify-content:space-between; align-items:center;">');
    content = content.replace(/<div style="display:flex; gap:5px;">(\s*<button onclick="window\.waLead)/g, '<div style="display:flex; gap:5px; flex-wrap:wrap; justify-content:space-between; align-items:center;">');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed container in ' + file);
}

fixContainer('e:/AI/apk/SalesProWeb/index.html');
fixContainer('e:/AI/apk/SalesProWeb/ui-components.js');
