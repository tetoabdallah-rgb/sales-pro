const fs = require('fs');
let file = 'e:/AI/apk/SalesProWeb/auth.js';
let content = fs.readFileSync(file, 'utf-8');

let oldBlock = `        // Auto-restore from cloud if local data is completely empty
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
        }`;

let newBlock = `        // Auto-restore from cloud if local data is completely empty
        if ((!S || S.length === 0) && (!T || T.length === 0) && (!C || C.length === 0)) {
            console.log('Local data is empty, attempting auto-restore from cloud...');
            db.collection('cloud_backups').doc(user.uid).get().then(async doc => {
                if (doc.exists) {
                    let d = doc.data();
                    let fullStr = "";
                    if (d.backupData) {
                        fullStr = d.backupData;
                    } else {
                        let numChunks = d.chunks || 1;
                        for(let i=0; i<numChunks; i++){
                            let c = await db.collection('cloud_backups').doc(user.uid).collection('data').doc('chunk_'+i).get();
                            if(c.exists) fullStr += c.data().data;
                        }
                    }
                    if (fullStr) {
                        let p = JSON.parse(fullStr);
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
                }
            }).catch(err => console.error('Auto-restore failed:', err));
        }`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(file, content, 'utf-8');
    console.log('auth.js chunking patched successfully');
} else {
    console.log('Pattern not found');
}
