const fs = require('fs');
let file = 'e:/AI/apk/SalesProWeb/gdrive.js';
let content = fs.readFileSync(file, 'utf-8');

let newCode = `// js/gdrive.js - Firebase Cloud Sync (with Chunking for large files)

window.cloudAutoSave = async function(label) {
    if (!currentUser || !db) return;
    try {
        let dump = {
            salesData:  S        || [],
            targetData: T        || [],
            accCats:    accCats  || [],
            hwCats:     hwCats   || [],
            payData:    C        || [],
            duesData:   D        || [],
            lastUpdated: new Date().toISOString(),
            savedBy: currentUser.email || currentUser.uid
        };
        
        let str = JSON.stringify(dump);
        const chunkSize = 800000;
        let numChunks = Math.ceil(str.length / chunkSize);
        
        // Save metadata
        await db.collection('cloud_backups').doc(currentUser.uid).set({
            chunks: numChunks,
            timestamp:  firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdated: dump.lastUpdated,
            savedBy: dump.savedBy
        });
        
        // Save chunks
        for(let i = 0; i < numChunks; i++) {
            let part = str.substring(i * chunkSize, (i + 1) * chunkSize);
            await db.collection('cloud_backups').doc(currentUser.uid).collection('data').doc('chunk_'+i).set({ data: part });
        }

        let tme = new Date().toLocaleString(L === 'ar' ? 'ar-EG' : 'en-US');
        if (typeof toast === 'function') toast((L === 'ar' ? '?? ?? ????? ?? ???????: ' : '?? Cloud saved: ') + (label || ''), 'success');
        let ds = document.getElementById('driveStatus');
        if (ds) ds.innerHTML = \`? <strong>\${L === 'ar' ? '??? ??????:' : 'Last sync:'}</strong> \${tme}\`;
    } catch(e) {
        console.warn('Cloud auto-save failed:', e);
        if (typeof toast === 'function') toast(L === 'ar' ? '??? ??? ????? ????? (???? ????? ???? ????)' : 'Save failed', 'error');
    }
};

window.backupToGoogleDrive = async function() {
    if (!currentUser) {
        if (typeof toast === 'function') toast(L === 'ar' ? '??? ????? ?????? ?????' : 'Login required', 'error');
        return;
    }
    if (typeof toast === 'function') toast(L === 'ar' ? '???? ????? ?? ???????...' : 'Saving to cloud...', 'info');
    await window.cloudAutoSave(L === 'ar' ? '????' : 'Manual');
};

window.restoreFromGoogleDrive = async function() {
    if (!currentUser) {
        if (typeof toast === 'function') toast(L === 'ar' ? '??? ????? ?????? ?????' : 'Login required', 'error');
        return;
    }
    if (!confirm(L === 'ar' ? '???? ??????? ???????? ??????? ??????? ???????. ??????' : 'This will replace current data with the cloud backup. Sure?')) return;

    try {
        if (typeof toast === 'function') toast(L === 'ar' ? '???? ?????????...' : 'Restoring...', 'info');
        let doc = await db.collection('cloud_backups').doc(currentUser.uid).get();
        if (!doc.exists) {
            if (typeof toast === 'function') toast(L === 'ar' ? '?? ???? ???? ???????? ?? ???????!' : 'No cloud backup found!', 'error');
            return;
        }
        
        let d = doc.data();
        let fullStr = "";
        
        if (d.backupData) {
            // Old format
            fullStr = d.backupData;
        } else {
            // Chunked format
            let numChunks = d.chunks || 1;
            for(let i=0; i<numChunks; i++){
                let c = await db.collection('cloud_backups').doc(currentUser.uid).collection('data').doc('chunk_'+i).get();
                if(c.exists) fullStr += c.data().data;
            }
        }
        
        if (!fullStr) {
            if (typeof toast === 'function') toast(L === 'ar' ? '?????? ????? ?? ?????' : 'Backup corrupted or empty', 'error');
            return;
        }
        
        let p = JSON.parse(fullStr);
        if (p.salesData)  { S       = p.salesData;  sv('salesData',  S); }
        if (p.targetData) { T       = p.targetData; sv('targetData', T); }
        if (p.accCats)    { accCats = p.accCats;    sv('accCats',    accCats); }
        if (p.hwCats)     { hwCats  = p.hwCats;     sv('hwCats',     hwCats); }
        if (p.payData)    { C       = p.payData;    sv('payData',    C); }
        if (p.duesData)   { D       = p.duesData;   sv('duesData',   D); }

        let updatedAt = p.lastUpdated ? new Date(p.lastUpdated).toLocaleString(L === 'ar' ? 'ar-EG' : 'en-US') : '';
        if (typeof toast === 'function') toast(\`? \${L === 'ar' ? '?? ?????????! ??? ???: ' : 'Restored! Last saved: '} \${updatedAt}\`, 'success');

        setTimeout(() => { window.location.reload(); }, 1500);
    } catch(e) {
        console.error('Cloud Restore Error:', e);
        if (typeof toast === 'function') toast(L === 'ar' ? '??? ????? ?????????' : 'Error restoring', 'error');
    }
};

window.getCloudInfo = async function() {
    if (!currentUser || !db) return null;
    try {
        let doc = await db.collection('cloud_backups').doc(currentUser.uid).get();
        if (!doc.exists) return null;
        let d = doc.data();
        
        let fullStr = "";
        if (d.backupData) {
            fullStr = d.backupData;
        } else {
            let numChunks = d.chunks || 1;
            for(let i=0; i<numChunks; i++){
                let c = await db.collection('cloud_backups').doc(currentUser.uid).collection('data').doc('chunk_'+i).get();
                if(c.exists) fullStr += c.data().data;
            }
        }
        
        if(!fullStr) return null;
        let p = JSON.parse(fullStr);
        return {
            lastUpdated: p.lastUpdated || d.lastUpdated,
            savedBy: p.savedBy || d.savedBy,
            salesCount: (p.salesData || []).length,
            payCount: (p.payData || []).length
        };
    } catch(e) { return null; }
};
`;

fs.writeFileSync(file, newCode, 'utf-8');
console.log('gdrive.js successfully updated with chunking');
