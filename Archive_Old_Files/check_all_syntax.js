const fs = require('fs');
const cp = require('child_process');
let html = fs.readFileSync('index.html', 'utf8');
let regex = /<script>([\s\S]*?)<\/script>/g;
let match;
let i = 1;
while ((match = regex.exec(html)) !== null) {
    let code = match[1];
    fs.writeFileSync(`temp_script_${i}.js`, code, 'utf8');
    try {
        cp.execSync(`.\\node-v20.11.1-win-x64\\node.exe -c temp_script_${i}.js`);
        console.log(`Script ${i} (length: ${code.length}): Syntax OK`);
    } catch (e) {
        console.log(`Script ${i} (length: ${code.length}): Syntax ERROR`);
        console.log(e.stderr.toString());
    }
    i++;
}
