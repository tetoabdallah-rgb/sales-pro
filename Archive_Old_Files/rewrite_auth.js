const fs = require('fs');

let file = 'e:/AI/apk/SalesProWeb/auth.js';
let content = fs.readFileSync(file, 'utf-8');

let newBlock = `        // Auto-restore from cloud if local data is completely empty
        if ((!S || S.length === 0) && (!T || T.length === 0) && (!C || C.length === 0)) {
            console.log('Local data is empty, attempting auto-restore from cloud...');
            db.collection('users').doc(user.uid).get().then(async doc => {
                if (doc.exists && doc.data().backup_chunks) {
                    let d = doc.data();
                    let fullStr = "";
                    let numChunks = d.backup_chunks || 1;
                    for(let i=0; i<numChunks; i++){
                        let c = await db.collection('users').doc(user.uid).collection('chunks').doc('backup_chunk_'+i).get();
                        if(c.exists) fullStr += c.data().data;
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

// Let's replace the whole block by finding the start and end of it.
// The easiest way is regex or finding the exact old text if it hasn't changed much
// Let's just find "if ((!S || S.length === 0)" and replace up to "catch(err => console.error('Auto-restore failed:', err));"
let startIndex = content.indexOf('if ((!S || S.length === 0) && (!T || T.length === 0) && (!C || C.length === 0)) {');
let endIndexStr = "}).catch(err => console.error('Auto-restore failed:', err));";
let endIndex = content.indexOf(endIndexStr, startIndex);

if(startIndex > -1 && endIndex > -1) {
    let before = content.substring(0, startIndex);
    // Include the ending brace of the catch block
    let endOfBlock = endIndex + endIndexStr.length + 1; // +1 to capture the closing brace of the if block:  }
    
    // Actually the if block has a closing brace after the catch.
    let afterCatch = content.indexOf('}', endIndex) + 1;
    let after = content.substring(afterCatch);
    
    content = before + newBlock + after;
    fs.writeFileSync(file, content, 'utf-8');
    console.log('auth.js auto-restore path rewritten securely');
} else {
    console.log('Could not find block to replace in auth.js', startIndex, endIndex);
}
