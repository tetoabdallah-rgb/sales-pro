const fs = require('fs');
let content = fs.readFileSync('new_features.js', 'utf8');

const injectionCode = `

// =======================
// TARGETS ENHANCEMENT (نسب المحقق)
// =======================
window.rTgt = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let sData = typeof getFilteredSales === 'function' ? getFilteredSales() : window.S;
    let sMap = {}, accSMap = {}, hwSMap = {};
    let pMap = {}, accPMap = {}, hwPMap = {};
    
    if(sData && sData.length > 0) {
        sData.forEach(r => {
            let c = r.Customer;
            if(!c) return;
            let s = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
            let p = typeof getProfitVal === 'function' ? getProfitVal(r) : 0;
            let isA = typeof isAcc === 'function' ? isAcc(r['Item Class Name']) : false;
            let isH = typeof isHW === 'function' ? isHW(r['Item Class Name']) : false;
            sMap[c] = (sMap[c] || 0) + s;
            pMap[c] = (pMap[c] || 0) + p;
            if (isA) { accSMap[c] = (accSMap[c] || 0) + s; accPMap[c] = (accPMap[c] || 0) + p; }
            if (isH) { hwSMap[c] = (hwSMap[c] || 0) + s; hwPMap[c] = (hwPMap[c] || 0) + p; }
        });
    }
    
    let cS = (c) => sMap[c] || 0;
    let cSF = (c, f) => f === window.isAcc ? (accSMap[c] || 0) : (hwSMap[c] || 0);
    let cPF = (c, f) => f === window.isAcc ? (accPMap[c] || 0) : (hwPMap[c] || 0);

    let tt=0, ta=0;
    if(window.T && window.T.length > 0) {
        window.T.forEach(r => { tt += Number(r.Target)||0; ta += cS(r.Customer); });
    }
    
    let mDiv = document.getElementById('M');
    if(!mDiv) return;
    
    mDiv.innerHTML = \`
        <div class="ph" style="display:flex;align-items:center;gap:12px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">\${window.ICONS ? window.ICONS.targets : '🎯'}</span> \${typeof t==='function'?t('targets'):(L==='ar'?'المستهدفات':'Targets')}</h1>
            <button id="bExTgt" class="btn bg-g" style="color:#fff;border:none;margin-left:auto;"><span style="font-size:1rem;">&#x1F4E5;</span> Excel</button>
        </div>
        <div class="kg">
            <div class="ki"><div class="lb">\${L==='ar'?'التارجت':'Target'}</div><div class="vl">\${typeof aFmt==='function'?aFmt(tt):tt}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?'المحقق':'Achieved'}</div><div class="vl">\${typeof aFmt==='function'?aFmt(ta):ta}</div></div>
            <div class="ki"><div class="lb">%</div><div class="vl">\${typeof aFmt==='function'?aFmt(tt>0?ta/tt*100:0,true):(tt>0?(ta/tt*100).toFixed(1)+'%':'0%')}</div></div>
        </div>
        <div class="tb">
            <div class="tbt"><h3>\${typeof t==='function'?t('targets'):(L==='ar'?'المستهدفات':'Targets')}</h3><input class="sbox" id="tsr" placeholder="..."></div>
            <div class="tbs">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr>
                            <th>\${L==='ar'?'العميل':'Customer'}</th>
                            <th>\${L==='ar'?'التارجت':'Target'}</th>
                            <th>\${L==='ar'?'المحقق':'Achieved'}</th>
                            <th style="width:200px;">\${L==='ar'?'نسبة التحقيق':'% Progress'}</th>
                            <th>Acc</th>
                            <th>Acc P</th>
                            <th>HW</th>
                            <th>HW P</th>
                            <th>St</th>
                        </tr>
                    </thead>
                    <tbody id="ttb"></tbody>
                </table>
            </div>
        </div>
    \`;
    
    let btnEx = document.getElementById('bExTgt');
    if(btnEx && typeof exportToExcel === 'function') {
        btnEx.onclick = () => exportToExcel(window.T.map(r => ({ Customer: r.Customer, Target: Number(r.Target)||0, Achieved: cS(r.Customer) })), 'Targets_Report');
    }

    function fTg(d){
        let ttb = document.getElementById('ttb');
        if(!ttb) return;
        ttb.innerHTML = d.map(r => {
            let tg = Number(r.Target)||0, a = cS(r.Customer), p = tg>0 ? a/tg*100 : 0;
            
            // Progress Bar HTML
            let pColor = p >= 100 ? 'var(--gn)' : p >= 60 ? 'var(--am)' : 'var(--rd)';
            let pBar = \`<div style="width:100%;background:var(--bg3);border-radius:10px;height:12px;overflow:hidden;position:relative;min-width:150px;border:1px solid var(--bd);">
                            <div style="width:\${Math.min(p, 100)}%;background:\${pColor};height:100%;transition:width 0.5s;"></div>
                        </div>
                        <div style="font-size:0.85rem;color:var(--tx1);font-weight:bold;margin-top:4px;">\${typeof pc==='function'?pc(p):p.toFixed(1)+'%'}</div>\`;
            
            return \`<tr>
                <td style="font-weight:bold;">\${r.Customer}</td>
                <td style="color:var(--tx2);">\${typeof fmt==='function'?fmt(tg):tg}</td>
                <td style="color:var(--ac);font-weight:bold;">\${typeof fmt==='function'?fmt(a):a}</td>
                <td style="vertical-align:middle;padding:10px;">\${pBar}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">\${typeof fmt==='function'?fmt(cSF(r.Customer,window.isAcc)):0}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">\${typeof fmt==='function'?fmt(cPF(r.Customer,window.isAcc)):0}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">\${typeof fmt==='function'?fmt(cSF(r.Customer,window.isHW)):0}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">\${typeof fmt==='function'?fmt(cPF(r.Customer,window.isHW)):0}</td>
                <td><span class="badge \${p>=100?'bg-g':p>=60?'bg-a':'bg-r'}">\${p>=100?'&#x2B50;':p>=60?'&#x1F44D;':'&#x1F44E;'}</span></td>
            </tr>\`;
        }).join('');
    }
    if(window.T) fTg(window.T);
    
    let tsr = document.getElementById('tsr');
    if(tsr && typeof debounce === 'function') {
        tsr.oninput = debounce(e => {
            let v = e.target.value.toLowerCase();
            fTg(v && window.T ? window.T.filter(r => (r.Customer||'').toLowerCase().includes(v)) : (window.T||[]));
        }, 300);
    }
};

`;

if (!content.includes('TARGETS ENHANCEMENT')) {
    fs.writeFileSync('new_features.js', content + '\n' + injectionCode, 'utf8');
    console.log('Successfully injected TARGETS ENHANCEMENT logic into new_features.js');
} else {
    // If it exists, replace it
    let lines = content.split('\n');
    let start = lines.findIndex(l => l.includes('TARGETS ENHANCEMENT'));
    if (start > -1) {
        fs.writeFileSync('new_features.js', lines.slice(0, start).join('\n') + '\n' + injectionCode, 'utf8');
        console.log('Successfully replaced TARGETS ENHANCEMENT logic in new_features.js');
    }
}
