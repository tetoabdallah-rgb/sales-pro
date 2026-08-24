const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

// Replace window.S with (typeof S !== "undefined" ? S : [])
code = code.replace(/window\.S(\s*\|\|)/g, '(typeof S !== "undefined" ? S : [])$1');
code = code.replace(/window\.S([^a-zA-Z0-9_])/g, '(typeof S !== "undefined" ? S : [])$1');

// Replace window.T with (typeof T !== "undefined" ? T : [])
code = code.replace(/window\.T(\s*\|\|)/g, '(typeof T !== "undefined" ? T : [])$1');
code = code.replace(/window\.T([^a-zA-Z0-9_])/g, '(typeof T !== "undefined" ? T : [])$1');

// Replace window.isAcc with isAcc
code = code.replace(/window\.isAcc/g, 'isAcc');

// Replace window.isHW with isHW
code = code.replace(/window\.isHW/g, 'isHW');

// Replace window.ICONS with ICONS
code = code.replace(/window\.ICONS/g, 'ICONS');

fs.writeFileSync('new_features.js', code, 'utf8');
console.log('Fixed globals in new_features.js');
