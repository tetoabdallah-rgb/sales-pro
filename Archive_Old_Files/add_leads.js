const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

const leadsCode = `
// --- LEADS ---
window.rLeads = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let html = \`
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🤝</span> \${L==='ar'?'عملاء محتملين (Leads)':'Potential Leads'}</h1>
            <button class="btn bg-p" onclick="addLeadModal()" style="color:#fff;border:none;">\${L==='ar'?'إضافة عميل محتمل':'Add Lead'}</button>
        </div>
        <div class="card" id="leadsList" style="margin-top:20px;">
            <div style="overflow-x:auto;">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--bd);">
                            <th style="padding:15px 10px;color:var(--tx2);">\${L==='ar'?'اسم العميل':'Lead Name'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">\${L==='ar'?'رقم الهاتف':'Phone'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">\${L==='ar'?'المصدر':'Source'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">\${L==='ar'?'الحالة':'Status'}</th>
                        </tr>
                    </thead>
                    <tbody id="lTbody"></tbody>
                </table>
            </div>
        </div>
    \`;
    let M = document.getElementById('M');
    if(M) { M.innerHTML = html; loadLeads(); }
};

function loadLeads() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let leadsData = JSON.parse(localStorage.getItem('sp_leads') || '[]');
    let tb = document.getElementById('lTbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (leadsData.length === 0) {
        tb.innerHTML = \`<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--tx3);">\${L==='ar'?'لا يوجد عملاء محتملين بعد.':'No leads yet.'}</td></tr>\`;
        return;
    }
    leadsData.forEach(v => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        tr.innerHTML = \`
            <td style="padding:15px 10px;font-weight:bold;color:var(--tx1);">\${v.name}</td>
            <td style="padding:15px 10px;">\${v.phone || '-'}</td>
            <td style="padding:15px 10px;">\${v.source || '-'}</td>
            <td style="padding:15px 10px;"><span style="background:var(--bg3);padding:4px 8px;border-radius:4px;color:var(--pu);">\${v.status || 'New'}</span></td>
        \`;
        tb.appendChild(tr);
    });
}

window.addLeadModal = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let h = \`
        <h3 style="margin-bottom:20px;font-size:1.2rem;display:flex;align-items:center;gap:8px;">🤝 \${L==='ar'?'إضافة عميل محتمل':'Add New Lead'}</h3>
        <label class="sp-form-label">\${L==='ar'?'الاسم':'Name'}</label>
        <input type="text" id="nlName" class="sp-form-input">
        <label class="sp-form-label">\${L==='ar'?'رقم الهاتف':'Phone'}</label>
        <input type="text" id="nlPhone" class="sp-form-input">
        <label class="sp-form-label">\${L==='ar'?'المصدر (فيسبوك، زيارة، الخ)':'Source'}</label>
        <input type="text" id="nlSource" class="sp-form-input">
        <button class="sp-btn-primary" onclick="saveLead()">\${L==='ar'?'حفظ العميل':'Save Lead'}</button>
    \`;
    let m = document.createElement('div');
    m.className = 'sp-modal-overlay';
    m.id = 'lModal';
    m.innerHTML = \`<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>\${h}</div>\`;
    document.body.appendChild(m);
};

window.saveLead = function() {
    let n = document.getElementById('nlName').value;
    let p = document.getElementById('nlPhone').value;
    let s = document.getElementById('nlSource').value;
    if(!n) { alert('الاسم مطلوب'); return; }
    let leadsData = JSON.parse(localStorage.getItem('sp_leads') || '[]');
    leadsData.push({ id: Date.now(), name: n, phone: p, source: s, status: 'New' });
    localStorage.setItem('sp_leads', JSON.stringify(leadsData));
    let modal = document.getElementById('lModal');
    if(modal) modal.remove();
    loadLeads();
    if(typeof toast === 'function') toast('تم الحفظ بنجاح', 'success');
};
`;

code = code.replace('// --- TARGETS ---', leadsCode + '\n// --- TARGETS ---');
fs.writeFileSync('new_features.js', code, 'utf8');
console.log('Added leads code back');
