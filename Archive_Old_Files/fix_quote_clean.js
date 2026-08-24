const fs = require('fs');
const genQuote = fs.readFileSync('e:/AI/apk/SalesProWeb/generateQuote.js', 'utf8');

function surgicalReplace(file) {
    let content = fs.readFileSync(file, 'utf8');
    const startToken = 'window.generateQuote = function';
    let startIndex = content.lastIndexOf(startToken);
    if (startIndex === -1) {
        console.log('Start not found in ' + file);
        return;
    }
    
    // Find the end token after startIndex
    const endToken = 'document.body.appendChild(modal);';
    let endIndex = content.indexOf(endToken, startIndex);
    if (endIndex === -1) {
        console.log('End not found in ' + file);
        return;
    }
    
    let endOfBlock = content.indexOf('};', endIndex);
    if (endOfBlock === -1) {
        console.log('End brace not found in ' + file);
        return;
    }
    endOfBlock += 2; // include '};'
    
    let newContent = content.substring(0, startIndex) + genQuote + content.substring(endOfBlock);
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Successfully replaced in ' + file);
}

surgicalReplace('e:/AI/apk/SalesProWeb/index.html');
surgicalReplace('e:/AI/apk/SalesProWeb/ui-components.js');
