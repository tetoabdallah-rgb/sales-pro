const fs = require('fs');

function cleanup(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove the leaked global window.addQItem block
    let leakStart = content.indexOf('    window.addQItem = () => { items.push({desc');
    if(leakStart > -1) {
        let scriptEnd = content.indexOf('</script>', leakStart);
        if(scriptEnd > -1) {
            content = content.substring(0, leakStart) + '\n' + content.substring(scriptEnd);
            fs.writeFileSync(file, content, 'utf8');
            console.log('Cleaned up ' + file);
        } else {
            // maybe in ui-components.js
            let commentEnd = content.indexOf('// =================================', leakStart);
            if (commentEnd > -1) {
                content = content.substring(0, leakStart) + '\n' + content.substring(commentEnd);
                fs.writeFileSync(file, content, 'utf8');
                console.log('Cleaned up ' + file);
            }
        }
    }
}

cleanup('e:/AI/apk/SalesProWeb/index.html');
cleanup('e:/AI/apk/SalesProWeb/ui-components.js');
