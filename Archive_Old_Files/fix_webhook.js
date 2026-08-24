const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetStr = `fetch(wurl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: repEmail, reportData: data, timestamp: new Date().toISOString() })
            })`;

const replaceStr = `fetch(wurl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ email: repEmail, reportData: data, timestamp: new Date().toISOString() })
            })`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('index.html', code, 'utf8');
console.log('Fixed Webhook CORS in index.html');
