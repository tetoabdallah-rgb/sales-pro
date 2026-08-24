const fs = require('fs');
let file = 'e:/AI/apk/SalesProWeb/ui-components.js';
let content = fs.readFileSync(file, 'utf-8');

// After upload completes - add cloudAutoSave call
// Current bUpload code:
let oldUpload = `$('bUpload').onclick = () => {
        let done = 0, total = 0;
        let fS = $('fSales').files[0], fT = $('fTarget').files[0], fP = $('fPay').files[0];
        if(!fS && !fT && !fP) { toast(L==='ar'?TUI('Choose a file first!'):'Choose a file first!'); return; }
        if(fS) { total++; parseFile(fS, d => { S = d; sv('salesData', d); done++; if(done===total) { toast(L==='ar'?TUI('? Done'):'? Done'); render(); } }); }
        if(fT) { total++; parseFile(fT, d => { T = d; sv('targetData', d); done++; if(done===total) { toast(L==='ar'?TUI('? Done'):'? Done'); render(); } }); }
        if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) { toast(L==='ar'?TUI('? Done'):'? Done'); render(); } }, 'Payment Ref'); }
    };`;

let newUpload = `$('bUpload').onclick = () => {
        let done = 0, total = 0;
        let fS = $('fSales').files[0], fT = $('fTarget').files[0], fP = $('fPay').files[0];
        if(!fS && !fT && !fP) { toast(L==='ar'?TUI('Choose a file first!'):'Choose a file first!'); return; }
        let onAllDone = () => {
            toast(L==='ar' ? '? ?? ????? ????????!' : '? Data Updated!');
            render();
            // Auto-save to Firebase cloud
            if (typeof window.cloudAutoSave === 'function') {
                window.cloudAutoSave(L==='ar' ? '??? ?????' : 'File Upload');
            }
        };
        if(fS) { total++; parseFile(fS, d => { S = d; sv('salesData', d); done++; if(done===total) onAllDone(); }); }
        if(fT) { total++; parseFile(fT, d => { T = d; sv('targetData', d); done++; if(done===total) onAllDone(); }); }
        if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) onAllDone(); }, 'Payment Ref'); }
    };`;

if (content.includes(oldUpload)) {
    content = content.replace(oldUpload, newUpload);
    console.log('bUpload patched - auto cloud save after upload');
} else {
    console.log('Pattern not found - checking...');
    let idx = content.indexOf("$('bUpload').onclick");
    console.log('bUpload at idx:', idx);
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Done');
