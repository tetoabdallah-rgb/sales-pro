const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let match = html.match(/<script>([\s\S]*?)<\/script>/);
if (match) {
    fs.writeFileSync('temp_script.js', match[1], 'utf8');
    try {
        require('child_process').execSync('.\\node-v20.11.1-win-x64\\node.exe -c temp_script.js');
        console.log("Syntax is OK.");
    } catch (e) {
        console.log("Syntax error in index.html script!");
        console.log(e.stderr.toString());
    }
}
