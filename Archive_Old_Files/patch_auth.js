const fs = require('fs');
let file = 'e:/AI/apk/SalesProWeb/auth.js';
let content = fs.readFileSync(file, 'utf-8');

let oldStr = `        } else {
            loadOwnDoc();
        }
        
        if(typeof init === 'function') init();`;

let newStr = `        } else {
            loadOwnDoc();
        }
        
        // Auto-restore from cloud if local data is completely empty
        if ((!S || S.length === 0) && (!T || T.length === 0) && (!C || C.length === 0)) {
            console.log('Local data is empty, attempting auto-restore from cloud...');
            db.collection('cloud_backups').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().backupData) {
                    let p = JSON.parse(doc.data().backupData);
                    let changed = false;
                    if (p.salesData && p.salesData.length > 0)  { S = p.salesData;  sv('salesData',  S); changed = true; }
                    if (p.targetData && p.targetData.length > 0){ T = p.targetData; sv('targetData', T); changed = true; }
                    if (p.payData && p.payData.length > 0)      { C = p.payData;    sv('payData',    C); changed = true; }
                    if (p.duesData)     { D = p.duesData;   sv('duesData',   D); }
                    if (p.accCats)      { accCats = p.accCats; sv('accCats', accCats); }
                    if (p.hwCats)       { hwCats = p.hwCats;   sv('hwCats', hwCats); }
                    
                    if (changed) {
                        if (typeof toast === 'function') toast(L === 'ar' ? '? ?? ??????? ?????? ??????? ????????' : '? Cloud data auto-restored', 'success');
                        setTimeout(() => { window.location.reload(); }, 1500);
                    }
                }
            }).catch(err => console.error('Auto-restore failed:', err));
        }
        
        if(typeof init === 'function') init();`;

if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    console.log('auth.js patched successfully');
} else {
    console.log('Pattern not found - checking...');
    console.log(content.substring(content.indexOf('loadOwnDoc();'), content.indexOf('loadOwnDoc();') + 200));
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Done');
