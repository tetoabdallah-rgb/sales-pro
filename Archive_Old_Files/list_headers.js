const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

let pos = 0;
let count = 0;
while (true) {
    let idx = c.indexOf('class="ph"', pos);
    if (idx === -1) break;
    console.log(`--- Header ${++count} at ${idx} ---`);
    console.log(c.substring(idx - 10, idx + 250));
    pos = idx + 10;
    if (count >= 10) break;
}
