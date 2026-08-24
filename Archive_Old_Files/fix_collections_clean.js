const fs = require('fs');

let file = 'e:/AI/apk/SalesProWeb/ui-components.js';
let content = fs.readFileSync(file, 'utf-8');

// Find the exact start and end of rCollections function
let startIdx = content.indexOf('function rCollections()');
if (startIdx === -1) { console.log('ERROR: rCollections not found!'); process.exit(1); }

// Find the closing brace of this function by counting braces
let braceCount = 0;
let i = startIdx;
let inFunc = false;
while (i < content.length) {
    if (content[i] === '{') { braceCount++; inFunc = true; }
    if (content[i] === '}') { braceCount--; }
    if (inFunc && braceCount === 0) { i++; break; }
    i++;
}

let endIdx = i;
console.log('Found rCollections from', startIdx, 'to', endIdx);
console.log('Old function length:', endIdx - startIdx);

// New clean rCollections
let newFunc = `function rCollections() {
    let tot = 0, accTot = 0, hwTot = 0;

    // Read acc/hw from Payment Ref. column in Collections sheet
    C.forEach(function(r) {
        let amt = getRowVal(r, ['Amount', 'Collection']);
        let ref = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();
        tot += amt;
        if (ref === 'acc' || ref.startsWith('acc')) accTot += amt;
        else if (ref === 'hw' || ref.startsWith('hw')) hwTot += amt;
    });

    $('M').innerHTML = \`
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">\${ICONS.collections}</span> \${t('collections')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Total Collections'):'Total Collections'}</div><div class="vl">\${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?'?????????':'Accessories'}</div><div class="vl">\${aFmt(accTot)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?'???????':'Hardware'}</div><div class="vl">\${aFmt(hwTot)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Records'):'Records'}</div><div class="vl">\${aFmt(C.length)}</div></div>
        </div>
        \${C.length > 0 ? \`<div class="tb"><div class="tbt"><h3>\${t('collections')}</h3></div>
        <div class="tbs"><table><thead><tr>\${Object.keys(C[0]||{}).map(k=>\`<th>\${k}</th>\`).join('')}</tr></thead>
        <tbody>\${C.slice(0,200).map(r=>\`<tr>\${Object.keys(C[0]).map(k=>\`<td>\${r[k]||''}</td>\`).join('')}</tr>\`).join('')}</tbody>
        </table></div></div>\` : \`<div class="card"><p style="color:var(--tx2);text-align:center;">\${L==='ar'?TUI('No collections data. Upload a file from the Files page.'):'No collections data. Upload a file from the Files page.'}</p></div>\`}
    \`;
    initAnm && initAnm();
}`;

// Replace old function with new
content = content.substring(0, startIdx) + newFunc + content.substring(endIdx);

fs.writeFileSync(file, content, 'utf-8');
console.log('rCollections replaced cleanly. New length:', newFunc.length);
