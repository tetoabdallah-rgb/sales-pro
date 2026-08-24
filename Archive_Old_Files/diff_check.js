const fs = require('fs');
let r = fs.readFileSync('index_restored.html', 'utf8');
let i = fs.readFileSync('index.html', 'utf8');

let rScripts = r.match(/<script([\s\S]*?)<\/script>/g) || [];
let iScripts = i.match(/<script([\s\S]*?)<\/script>/g) || [];

console.log('r script count:', rScripts.length);
console.log('i script count:', iScripts.length);

rScripts.forEach((s, idx) => console.log(`r script ${idx} len: ${s.length}, first 50 chars: ${s.replace(/\s+/g,' ').substring(0,60)}`));
iScripts.forEach((s, idx) => console.log(`i script ${idx} len: ${s.length}, first 50 chars: ${s.replace(/\s+/g,' ').substring(0,60)}`));
