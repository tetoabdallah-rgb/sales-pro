const fs = require('fs');

let code = fs.readFileSync('new_features.js', 'utf8');

// 1. Update background fading
code = code.replace(/opacity:\s*0\.05;/g, "opacity: 0.15;\n        -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);\n        mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);");

// 2. Inject Dues Alerts in rCollections
// We need to find the WhatsApp injection for Collections and add the dues logic.
let waColIndex = code.indexOf('window.rCollections = function() {');
if (waColIndex !== -1) {
    let oldFunc = `window.rCollections = function() {
        originalRCol();
        setTimeout(() => {`;
        
    let newFunc = `window.rCollections = function() {
        originalRCol();
        setTimeout(() => {
            // --- Dues Alerts Logic ---
            let sData = typeof getFilteredSales === 'function' ? getFilteredSales() : (typeof S !== 'undefined' ? S : []);
            let cData = typeof C !== 'undefined' ? C : [];
            
            let sMap = {};
            sData.forEach(r => {
                let c = r.Customer || '';
                if(c) sMap[c] = (sMap[c]||0) + (typeof getSalesVal === 'function' ? getSalesVal(r) : 0);
            });
            
            let cMap = {};
            cData.forEach(r => {
                let keys = Object.keys(r);
                let getVal = (possibleNames) => {
                    let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\\s+/g, '') === pn.toLowerCase().replace(/\\s+/g, '')));
                    return k ? r[k] : undefined;
                };
                let cName = getVal(['Customer Name', 'Customer']) || '';
                let rawVal = getVal(['Amount', 'Collection']) || 0;
                let val = Number(rawVal.toString().replace(/,/g, '')) || 0;
                if(cName) cMap[cName] = (cMap[cName]||0) + val;
            });
            
            let duesHtml = '';
            let hasDues = false;
            Object.keys(sMap).forEach(c => {
                let sTot = sMap[c];
                let cTot = cMap[c] || 0;
                let due = sTot - cTot;
                if(due > 0 && sTot > 0) {
                    hasDues = true;
                    duesHtml += \`<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid rgba(255,0,0,0.2);"><strong style="color:var(--tx);font-size:0.9rem;">\${c}</strong><span class="badge bg-r" style="font-size:0.9rem;">متبقي: \${due.toLocaleString()}</span></div>\`;
                }
            });
            
            if(hasDues) {
                let m = document.getElementById('M');
                let ph = m.querySelector('.ph');
                if(ph) {
                    let duesCard = \`<div class="card" style="margin-top:15px; border-top:3px solid var(--rd); max-height:250px; overflow-y:auto;">
                        <h3 style="color:var(--rd); margin-bottom:10px; display:flex; align-items:center; gap:8px;">⚠️ تنبيهات المتأخرات (ديون العملاء)</h3>
                        \${duesHtml}
                    </div>\`;
                    ph.insertAdjacentHTML('afterend', duesCard);
                }
            }
            // --- End Dues Alerts Logic ---
            `;
            
    code = code.replace(oldFunc, newFunc);
}

fs.writeFileSync('new_features.js', code, 'utf8');
console.log("Background mask and Dues Alerts injected!");
