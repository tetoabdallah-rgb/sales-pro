const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

let regex = /<h1 id="spTitle".*?>.*?<\/h1>/i;
if (code.match(regex)) {
    code = code.replace(regex, "");
    console.log("Watermark removed.");
} else {
    console.log("Watermark not found.");
}

fs.writeFileSync('index.html', code, 'utf8');
