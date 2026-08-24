const fs = require('fs');

let file = 'e:/AI/apk/SalesProWeb/gdrive.js';
let content = fs.readFileSync(file, 'utf-8');

// replace the catch block in cloudAutoSave to use alert
content = content.replace(/console\.warn\('Cloud auto-save failed:', e\);\s*if \(typeof toast === 'function'\) toast\(.*?\);/g, "console.warn('Cloud auto-save failed:', e); alert('Sync Error: ' + e.message); if (typeof toast === 'function') toast(L === 'ar' ? '??? ?????: ' + e.message : 'Save failed: ' + e.message, 'error');");

fs.writeFileSync(file, content, 'utf-8');
console.log('gdrive.js updated with alert');
