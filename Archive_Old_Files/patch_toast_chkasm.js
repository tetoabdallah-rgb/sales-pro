const fs = require('fs');
let appFile = 'e:/AI/apk/SalesProWeb/app.js';
let appStr = fs.readFileSync(appFile, 'utf-8');

if (!appStr.includes('window.toast = ')) {
    let toastFunc = `
window.toast = function(msg, type = 'info') {
    let t = document.getElementById('TT');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => { t.className = 'toast'; }, 3000);
};
`;
    appStr += toastFunc;
    fs.writeFileSync(appFile, appStr, 'utf-8');
    console.log('Added toast to app.js');
}

let authFile = 'e:/AI/apk/SalesProWeb/auth.js';
let authStr = fs.readFileSync(authFile, 'utf-8');

// Remove the chkAsm() call inside doc.exists
authStr = authStr.replace(/chkAsm\(\);\s*syncUI\('done'\);/g, "syncUI('done');");

// Remove the entire chunks.onSnapshot block
authStr = authStr.replace(/db\.collection\('users'\)\.doc\(user\.uid\)\.collection\('chunks'\)\.onSnapshot\([\s\S]*?chkAsm\(\);\s*\}\);/g, "");

fs.writeFileSync(authFile, authStr, 'utf-8');
console.log('Removed chkAsm from auth.js');
