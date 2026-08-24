const fs = require('fs');

// 1. Update font in new_features.js
let nfCode = fs.readFileSync('new_features.js', 'utf8');
const fontCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        
        * {
            font-family: 'Cairo', sans-serif !important;
        }
`;
if (!nfCode.includes('family=Cairo')) {
    nfCode = nfCode.replace('<style>', '<style>\n' + fontCSS);
    nfCode = nfCode.replace("style.innerHTML = `", "style.innerHTML = `" + fontCSS);
    fs.writeFileSync('new_features.js', nfCode, 'utf8');
    console.log('Font injected into new_features.js');
}

// 2. Update backup icon in app.js
let appCode = fs.readFileSync('app.js', 'utf8');
appCode = appCode.replace("getImg('Floppy%20disk/3D/floppy_disk_3d.png')", "getImg('Cloud/3D/cloud_3d.png')");
fs.writeFileSync('app.js', appCode, 'utf8');
console.log('Icon updated in app.js');

// 3. Remove the floppy disk emoji from index.html text
let htmlCode = fs.readFileSync('index.html', 'utf8');
htmlCode = htmlCode.replace('النسخ الاحتياطي الشامل 💾', 'النسخ الاحتياطي السحابي ☁️');
fs.writeFileSync('index.html', htmlCode, 'utf8');
console.log('Text updated in index.html');

