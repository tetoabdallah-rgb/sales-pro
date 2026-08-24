const fs = require('fs');
const vm = require('vm');

let html = fs.readFileSync('index.html', 'utf8');
let regex = /<script.*?>([\s\S]*?)<\/script>/gi;
let match;
let i = 1;

while ((match = regex.exec(html)) !== null) {
    let js = match[1];
    try {
        new vm.Script(js);
        console.log('Script block ' + i + ' parsed successfully.');
    } catch (e) {
        console.log('Script block ' + i + ' SYNTAX ERROR:');
        console.log(e.stack.split('\n').slice(0, 5).join('\n'));
    }
    i++;
}
