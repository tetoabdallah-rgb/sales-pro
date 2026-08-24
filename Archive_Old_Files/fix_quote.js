const fs = require('fs');

const genQuote = fs.readFileSync('e:/AI/apk/SalesProWeb/generateQuote.js', 'utf8');

function updateFile(filePath, regex) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(regex, genQuote);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

// update index.html
updateFile('e:/AI/apk/SalesProWeb/index.html', /window\.generateQuote\s*=\s*function\(customerName\)\s*\{[\s\S]*?\};\s*$/m);
// update ui-components.js
updateFile('e:/AI/apk/SalesProWeb/ui-components.js', /window\.generateQuote\s*=\s*function\(customerName\)\s*\{[\s\S]*?\};\s*(?=\/\/ --)/m);

