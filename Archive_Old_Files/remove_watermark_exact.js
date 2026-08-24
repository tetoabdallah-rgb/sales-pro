const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

let searchStr = '<h1 id="spTitle" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); font-size:15rem; color:var(--p); opacity:0.03; z-index:0; pointer-events:none; white-space:nowrap;">SALES PRO</h1>';

if (code.includes(searchStr)) {
    code = code.replace(searchStr, "");
    fs.writeFileSync('index.html', code, 'utf8');
    console.log("Watermark removed via exact match!");
} else {
    console.log("Could not find the exact string.");
}
