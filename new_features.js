
// new_features.js - Universal, Safe, and Dynamic Injection

// --- DATA ACCESS HELPERS ---
function getS() { try { return JSON.parse(localStorage.getItem('salesData') || '[]'); } catch(e){ return []; } }
function getT() { try { return JSON.parse(localStorage.getItem('targetData') || '[]'); } catch(e){ return []; } }


// --- UI STYLES ---
(function injectStyles() {
    if(document.getElementById('sp-new-features-css')) return;
    let style = document.createElement('style');
    style.id = 'sp-new-features-css';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        
        * {
            font-family: 'Cairo', sans-serif !important;
        }

        body::after {
            content: "";
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100vw; height: 100vh;
            background: none;
            background-size: 100vw 100vh;
            opacity: 0.2; /* Increased opacity so it's clearly visible */
            pointer-events: none;
            z-index: 0;
            mix-blend-mode: screen; /* This removes the black background */
            /* filter: grayscale removed to keep the beautiful colors! */
        }
        
        /* Make sure cards and modals have some glassmorphism so the watermark shows elegantly behind them */
        .card, .sp-modal-content {
            background: rgba(15, 23, 42, 0.75) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05); /* Enhance glass effect */
        }
        
        .loader-overlay::after {
            content: "";
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100%; height: 100%;
            background: none;
            background-size: 100vw 100vh;
            opacity: 0.4;
            pointer-events: none;
            z-index: -1;
            mix-blend-mode: screen; /* Removes black background */
        }

        .sp-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
            display: flex; justify-content: center; align-items: center; z-index: 9999;
            opacity: 0; animation: spFadeIn 0.3s forwards;
        }
        .sp-modal-content {
            width: 90%; max-width: 450px;
            border-radius: 16px; padding: 24px; position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            transform: translateY(20px); animation: spSlideUp 0.3s forwards;
            border: 1px solid var(--bd);
        }
        .sp-modal-close {
            position: absolute; top: 16px; left: 16px; cursor: pointer;
            font-size: 1.5rem; color: var(--tx3); line-height: 1;
        }
        .sp-modal-close:hover { color: var(--rd); }
        @keyframes spFadeIn { to { opacity: 1; } }
        @keyframes spSlideUp { to { transform: translateY(0); } }
        
        .sp-form-label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--tx2); font-size: 0.9rem; }
        .sp-form-input { 
            width: 100%; padding: 12px; margin-bottom: 16px; 
            background: var(--bg3); border: 1px solid var(--bd); 
            color: var(--tx1); border-radius: 8px; font-family: inherit;
        }
        .sp-form-input:focus { border-color: var(--ac); outline: none; }
        .sp-btn-primary {
            width: 100%; padding: 12px; background: var(--ac); color: #fff;
            border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
            transition: opacity 0.2s;
        }
        .sp-btn-primary:hover { opacity: 0.9; }
    `;
    document.head.appendChild(style);
})();

// --- VISITS ---
window.rVisits = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let html = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🚗</span> ${L==='ar'?'الزيارات ومتابعة العملاء':'Visits & Follow-up'}</h1>
            <button class="btn" onclick="addVisitModal()" style="background:var(--ac);color:#fff;font-weight:bold;">➕ ${L==='ar'?'زيارة جديدة':'New Visit'}</button>
        </div>
        <div class="card" id="visitsList" style="margin-top:20px;">
            <div style="overflow-x:auto;">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--bd);">
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'التاريخ':'Date'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'العميل':'Customer'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'النتيجة':'Outcome'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الزيارة القادمة':'Next Visit'}</th>
                        </tr>
                    </thead>
                    <tbody id="vTbody"></tbody>
                </table>
            </div>
        </div>
    `;
    let M = document.getElementById('M');
    if(M) { M.innerHTML = html; loadVisits(); }
};

function loadVisits() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let visitsData = JSON.parse(localStorage.getItem('sp_visits') || '[]');
    let tb = document.getElementById('vTbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (visitsData.length === 0) {
        tb.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--tx3);">${L==='ar'?'لا توجد زيارات مسجلة. ابدأ بإضافة زيارة جديدة!':'No visits logged'}</td></tr>`;
        return;
    }
    visitsData.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(v => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        tr.innerHTML = `
            <td style="padding:15px 10px;">${v.date}</td>
            <td style="padding:15px 10px;font-weight:bold;color:var(--ac);">${v.customer}</td>
            <td style="padding:15px 10px;white-space:normal;">${v.outcome}</td>
            <td style="padding:15px 10px;"><span style="background:var(--bg3);padding:4px 8px;border-radius:4px;">${v.nextDate || '-'}</span></td>
        `;
        tb.appendChild(tr);
    });
}

window.addVisitModal = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let S_data = typeof getS === 'function' ? getS() : [];
    let T_data = [];
    try { T_data = JSON.parse(localStorage.getItem('targetData') || '[]'); } catch(e) {}
    let customCusts = [];
    try { customCusts = JSON.parse(localStorage.getItem('sp_custom_customers') || '[]'); } catch(e) {}

    let set1 = S_data.map(r => r.Customer).filter(Boolean);
    let set2 = T_data.map(r => r.Customer).filter(Boolean);
    let set3 = customCusts.map(c => typeof c === 'string' ? c : c.name || c.Customer).filter(Boolean);

    let cList = [...new Set([...set1, ...set2, ...set3])].sort((a,b) => a.localeCompare(b, 'ar'));
    let opts = cList.map(c => `<option value="${c}">${c}</option>`).join('');
    if(!opts) opts = `<option value="">${L==='ar'?'لا يوجد عملاء (يرجى رفع ملف المبيعات)':'No customers found'}</option>`;
    
    let h = `
        <h3 style="margin-bottom:20px;font-size:1.2rem;display:flex;align-items:center;gap:8px;">🚗 ${L==='ar'?'تسجيل زيارة جديدة':'Log New Visit'}</h3>
        <label class="sp-form-label">${L==='ar'?'العميل':'Customer'}</label>
        <select id="nvCust" class="sp-form-input">${opts}</select>
        <label class="sp-form-label">${L==='ar'?'تاريخ الزيارة':'Visit Date'}</label>
        <input type="date" id="nvDate" class="sp-form-input" value="${new Date().toISOString().split('T')[0]}">
        <label class="sp-form-label">${L==='ar'?'نتائج الزيارة / ملاحظات':'Outcome / Notes'}</label>
        <textarea id="nvOutcome" class="sp-form-input" style="height:80px;resize:vertical;" placeholder="${L==='ar'?'ماذا حدث في الزيارة؟':'What happened?'}"></textarea>
        <label class="sp-form-label">${L==='ar'?'موعد الزيارة القادمة':'Next Visit Date'}</label>
        <input type="date" id="nvNext" class="sp-form-input">
        <button class="sp-btn-primary" onclick="saveVisit()">${L==='ar'?'حفظ الزيارة':'Save Visit'}</button>
    `;
    let m = document.createElement('div');
    m.className = 'sp-modal-overlay';
    m.id = 'vModal';
    m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
    document.body.appendChild(m);
};

window.saveVisit = function() {
    let c = document.getElementById('nvCust').value;
    let d = document.getElementById('nvDate').value;
    let o = document.getElementById('nvOutcome').value;
    let n = document.getElementById('nvNext').value;
    if(!c || !d) { alert('العميل والتاريخ مطلوبان'); return; }
    let visitsData = JSON.parse(localStorage.getItem('sp_visits') || '[]');
    visitsData.push({ id: Date.now(), customer: c, date: d, outcome: o, nextDate: n });
    localStorage.setItem('sp_visits', JSON.stringify(visitsData));
    let modal = document.getElementById('vModal');
    if(modal) modal.remove();
    loadVisits();
    if(typeof toast === 'function') toast('تم حفظ الزيارة بنجاح', 'success');
};



﻿// --- LEADS ---
window.rLeads = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let html = `
        <div style="width: 100%; display: block;">
            <div class="ph" style="width: 100%;">
                <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🤝</span> ${L==='ar'?'عملاء محتملين (Leads)':'Potential Leads'}</h1>
                <button class="btn bg-p" onclick="addLeadModal()" style="color:#fff;border:none;">${L==='ar'?'إضافة عميل محتمل':'Add Lead'}</button>
            </div>
            <div class="card" id="leadsList" style="margin-top:20px; width: 100%;">
                <div style="overflow-x:auto;">
                    <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--bd);">
                                <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'اسم العميل':'Lead Name'}</th>
                                <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'رقم الهاتف':'Phone'}</th>
                                <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'المصدر':'Source'}</th>
                                <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الحالة':'Status'}</th>
                            </tr>
                        </thead>
                        <tbody id="lTbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    let M = document.getElementById('M');
    if(M) { 
        M.style.flex = "1";
        M.style.width = "100%";
        M.innerHTML = html; 
        loadLeads(); 
    }
};

function loadLeads() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let leadsData = JSON.parse(localStorage.getItem('sp_leads') || '[]');
    let tb = document.getElementById('lTbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (leadsData.length === 0) {
        tb.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--tx3);">${L==='ar'?'لا يوجد عملاء محتملين بعد.':'No leads yet.'}</td></tr>`;
        return;
    }
    leadsData.forEach(v => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        tr.innerHTML = `
            <td style="padding:15px 10px;font-weight:bold;color:var(--tx1);">${v.name}</td>
            <td style="padding:15px 10px;">${v.phone || '-'}</td>
            <td style="padding:15px 10px;">${v.source || '-'}</td>
            <td style="padding:15px 10px;"><span style="background:var(--bg3);padding:4px 8px;border-radius:4px;color:var(--pu);">${v.status || 'New'}</span></td>
        `;
        tb.appendChild(tr);
    });
}

window.addLeadModal = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let h = `
        <h3 style="margin-bottom:20px;font-size:1.2rem;display:flex;align-items:center;gap:8px;">🤝 ${L==='ar'?'إضافة عميل محتمل':'Add New Lead'}</h3>
        <label class="sp-form-label">${L==='ar'?'الاسم':'Name'}</label>
        <input type="text" id="nlName" class="sp-form-input">
        <label class="sp-form-label">${L==='ar'?'رقم الهاتف':'Phone'}</label>
        <input type="text" id="nlPhone" class="sp-form-input">
        <label class="sp-form-label">${L==='ar'?'المصدر (فيسبوك، إعلان، الخ)':'Source'}</label>
        <input type="text" id="nlSource" class="sp-form-input">
        <button class="sp-btn-primary" onclick="saveLead()">${L==='ar'?'حفظ العميل':'Save Lead'}</button>
    `;
    let m = document.createElement('div');
    m.className = 'sp-modal-overlay';
    m.id = 'lModal';
    m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">x</span>${h}</div>`;
    document.body.appendChild(m);
};

window.saveLead = function() {
    let n = document.getElementById('nlName').value;
    let p = document.getElementById('nlPhone').value;
    let s = document.getElementById('nlSource').value;
    if(!n) { alert(localStorage.getItem('sp_lang')==='ar'?'الرجاء إدخال اسم العميل':'Please enter lead name'); return; }
    
    let l = { id: Date.now(), name: n, phone: p, source: s, status: 'New' };
    let leadsData = JSON.parse(localStorage.getItem('sp_leads') || '[]');
    leadsData.push(l);
    localStorage.setItem('sp_leads', JSON.stringify(leadsData));
    
    let modal = document.getElementById('lModal');
    if(modal) modal.remove();
    loadLeads();
    if(typeof toast === 'function') toast(localStorage.getItem('sp_lang')==='ar'?'تم إضافة العميل بنجاح':'Lead added successfully', 'success');
    
    if (typeof auth !== 'undefined' && auth.currentUser && typeof db !== 'undefined') {
        db.collection('users').doc(auth.currentUser.uid).collection('leads').add(l).catch(e => console.error(e));
    }
};

  window.handleTargetImport = function(e) {
    let file = e.target.files[0];
    if(!file) return;
    let reader = new FileReader();
    reader.onload = ev => {
        try {
            let wb = typeof XLSX !== 'undefined' ? XLSX.read(new Uint8Array(ev.target.result), {type:'array'}) : null;
            if(!wb) { alert('Excel library not found!'); return; }
            let ws = wb.Sheets[wb.SheetNames[0]];
            let d = XLSX.utils.sheet_to_json(ws);
            let norm = d.map(r => {
                let Customer = r.Customer || r['العميل'] || r['Customer Name'] || r['اسم العميل'] || r['الاسم'];
                let Target = r.Target || r['التارجت'] || r['Total Target'] || r['تارجت'] || 0;
                let phone = r.Phone || r['رقم الموبايل'] || r['موبايل'] || r['رقم الهاتف'] || r['Mobile'] || r.phone || '';
                let address = r.Address || r['العنوان'] || r['عنوان'] || r.address || '';
                let hwTarget = r['Target HW'] || r['تارجت هاردوير'] || r['Hardware Target'] || r.hwTarget || 0;
                let accTarget = r['Target Acc'] || r['تارجت اكسسوارات'] || r['Accessories Target'] || r['تارجت اكسسوار'] || r.accTarget || 0;
                if(!Target && (hwTarget || accTarget)) Target = Number(hwTarget||0) + Number(accTarget||0);
                return { ...r, Customer, Target: Number(Target)||0, phone, address, hwTarget: Number(hwTarget)||0, accTarget: Number(accTarget)||0 };
            }).filter(r => r.Customer);
            T = norm;
            if(typeof sv === 'function') sv('targetData', norm);
            alert(localStorage.getItem('sp_lang')==='ar'?'تم استيراد البيانات بنجاح!':'Data imported successfully!');
            if(typeof window.rTgt === 'function') window.rTgt();
            if(typeof window.cloudAutoSave === 'function') window.cloudAutoSave('استيراد تارجت من إكسيل');
        } catch(err) {
            alert('Error reading file');
        }
    };
    reader.readAsArrayBuffer(file);
};

// --- TARGETS ---
window.rTgt = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let sData = typeof getFilteredSales === 'function' ? getFilteredSales() : getS();
    let tData = getT();
    
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

    let tt=0, ta=0, hwt=0, acct=0, hwa=0, acca=0;
    if(tData && tData.length > 0) {
        tData.forEach(r => { 
            tt += Number(r.Target)||0; 
            ta += cS(r.Customer); 
            hwt += Number(r.hwTarget)||0;
            acct += Number(r.accTarget)||0;
            hwa += cSF(r.Customer, window.isHW);
            acca += cSF(r.Customer, window.isAcc);
        });
    }
    
    let mDiv = document.getElementById('M');
    if(!mDiv) return;
    
    mDiv.innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px; flex-wrap:wrap;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${window.ICONS ? window.ICONS.targets : '🎯'}</span> ${typeof t==='function'?t('targets'):(L==='ar'?'المستهدفات':'Targets')}</h1>
            <div style="margin-left:auto; display:flex; gap:10px;">
                <button onclick="window.editCustomerTarget('')" class="btn btn-p" style="font-weight:bold; font-family:inherit;">+ ${L==='ar'?'إضافة عميل':'Add Customer'}</button>
                <input type="file" id="fImportTgt" accept=".xlsx,.xls,.csv" style="display:none;" onchange="window.handleTargetImport(event)">
                <button onclick="document.getElementById('fImportTgt').click()" class="btn" style="background:var(--ac);color:#fff;border:none; font-family:inherit;font-weight:bold;"><span style="font-size:1rem;">&#x1F4E4;</span> ${L==='ar'?'استيراد إكسيل':'Import'}</button>
                <button id="bExTgt" class="btn bg-g" style="color:#fff;border:none; font-family:inherit;font-weight:bold;"><span style="font-size:1rem;">&#x1F4E5;</span> ${L==='ar'?'تصدير إكسيل':'Export'}</button>
            </div>
        </div>
        <div class="kg" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
            <div class="ki"><div class="lb">${L==='ar'?'إجمالي التارجت':'Total Target'}</div><div class="vl" style="font-size:1.3rem;">${typeof aFmt==='function'?aFmt(tt):tt}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'إجمالي المحقق':'Total Achieved'}</div><div class="vl" style="font-size:1.3rem;">${typeof aFmt==='function'?aFmt(ta):ta}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'نسبة الكلي':'Total %'}</div><div class="vl" style="font-size:1.3rem;color:var(--ac);">${typeof aFmt==='function'?aFmt(tt>0?ta/tt*100:0,true):(tt>0?(ta/tt*100).toFixed(1)+'%':'0%')}</div></div>
            
            <div class="ki" style="border-left: 3px solid #ff9800;"><div class="lb">${L==='ar'?'تارجت هاردوير':'HW Target'}</div><div class="vl" style="font-size:1.3rem;">${typeof aFmt==='function'?aFmt(hwt):hwt}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'محقق هاردوير':'HW Achieved'}</div><div class="vl" style="font-size:1.3rem;">${typeof aFmt==='function'?aFmt(hwa):hwa}</div></div>
            <div class="ki"><div class="lb">% HW</div><div class="vl" style="font-size:1.3rem;color:#ff9800;">${typeof aFmt==='function'?aFmt(hwt>0?hwa/hwt*100:0,true):(hwt>0?(hwa/hwt*100).toFixed(1)+'%':'0%')}</div></div>
            
            <div class="ki" style="border-left: 3px solid #4caf50;"><div class="lb">${L==='ar'?'تارجت إكسسوار':'Acc Target'}</div><div class="vl" style="font-size:1.3rem;">${typeof aFmt==='function'?aFmt(acct):acct}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'محقق إكسسوار':'Acc Achieved'}</div><div class="vl" style="font-size:1.3rem;">${typeof aFmt==='function'?aFmt(acca):acca}</div></div>
            <div class="ki"><div class="lb">% Acc</div><div class="vl" style="font-size:1.3rem;color:#4caf50;">${typeof aFmt==='function'?aFmt(acct>0?acca/acct*100:0,true):(acct>0?(acca/acct*100).toFixed(1)+'%':'0%')}</div></div>
        </div>
        <div class="tb">
            <div class="tbt"><h3>${typeof t==='function'?t('targets'):(L==='ar'?'المستهدفات':'Targets')}</h3><input class="sbox" id="tsr" placeholder="..."></div>
            <div class="tbs">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr>
                            <th>${L==='ar'?'العميل / اتصال':'Customer / Contact'}</th>
                            <th>${L==='ar'?'التارجت الكلي':'Total Target'}</th>
                            <th>${L==='ar'?'المحقق':'Achieved'}</th>
                            <th style="width:200px;">${L==='ar'?'نسبة التحقيق':'% Progress'}</th>
                            <th>HW Tgt</th>
                            <th>HW Ach</th>
                            <th>Acc Tgt</th>
                            <th>Acc Ach</th>
                            <th>${L==='ar'?'إجراء':'Act'}</th>
                        </tr>
                    </thead>
                    <tbody id="ttb"></tbody>
                </table>
            </div>
        </div>
    `;
    
    if(document.getElementById('bExTgt') && typeof exportToExcel === 'function') {
        document.getElementById('bExTgt').onclick = () => exportToExcel(tData.map(r => ({ Customer: r.Customer, Phone: r.phone||'', Address: r.address||'', Target: Number(r.Target)||0, Achieved: cS(r.Customer), HW_Target: r.hwTarget||0, HW_Achieved: cSF(r.Customer,window.isHW), Acc_Target: r.accTarget||0, Acc_Achieved: cSF(r.Customer,window.isAcc) })), 'Targets_Report');
    }

    function fTg(d){
        let ttb = document.getElementById('ttb');
        if(!ttb) return;
        ttb.innerHTML = d.map(r => {
            let tg = Number(r.Target)||0, a = cS(r.Customer), p = tg>0 ? a/tg*100 : 0;
            let hwT = Number(r.hwTarget)||0, hwA = cSF(r.Customer,window.isHW);
            let accT = Number(r.accTarget)||0, accA = cSF(r.Customer,window.isAcc);
            let pColor = p >= 100 ? 'var(--gn)' : p >= 60 ? 'var(--am)' : 'var(--rd)';
            let pBar = `<div style="width:100%;background:var(--bg3);border-radius:10px;height:12px;overflow:hidden;position:relative;min-width:150px;border:1px solid var(--bd);">
                            <div style="width:${Math.min(p, 100)}%;background:${pColor};height:100%;transition:width 0.5s;"></div>
                        </div>
                        <div style="font-size:0.85rem;color:var(--tx1);font-weight:bold;margin-top:4px;">${typeof pc==='function'?pc(p):p.toFixed(1)+'%'}</div>`;
            
            let contactHTML = '';
            if(r.phone || r.address) {
                contactHTML = `<div style="font-size:0.8rem; color:var(--tx2); margin-top:4px;">&#x1F4DE; ${r.phone||'-'} <br/>&#x1F4CD; ${r.address||'-'}</div>`;
            }
            
            return `<tr>
                <td style="font-weight:bold;">${r.Customer}${contactHTML}</td>
                <td style="color:var(--tx2);">${typeof fmt==='function'?fmt(tg):tg}</td>
                <td style="color:var(--ac);font-weight:bold;">${typeof fmt==='function'?fmt(a):a}</td>
                <td style="vertical-align:middle;padding:10px;">${pBar}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">${typeof fmt==='function'?fmt(hwT):hwT}</td>
                <td style="font-size:0.9rem;">${typeof fmt==='function'?fmt(hwA):hwA}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">${typeof fmt==='function'?fmt(accT):accT}</td>
                <td style="font-size:0.9rem;">${typeof fmt==='function'?fmt(accA):accA}</td>
                <td>
                    <button onclick="window.openCustomerProfile('${r.Customer.replace(/'/g, "\\'")}')" class="btn btn-p" style="padding:4px 8px; font-size:0.8rem; margin-right:5px; font-family:inherit;">
                        👤 ${L==='ar'?'بروفايل':'Profile'}
                    </button>
                    <button onclick="window.editCustomerTarget('${r.Customer.replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:0.8rem; background:var(--bg3); border:1px solid var(--bd); font-family:inherit;">
                        ${L==='ar'?'تعديل':'Edit'}
                    </button>
                </td>
            </tr>`;
        }).join('');
    }
    if(tData) fTg(tData);
    
    let tsr = document.getElementById('tsr');
    if(tsr && typeof debounce === 'function') {
        tsr.oninput = debounce(e => {
            let v = e.target.value.toLowerCase();
            fTg(v && tData ? tData.filter(r => (r.Customer||'').toLowerCase().includes(v)) : (tData||[]));
        }, 300);
    }
};

// --- DORMANT 30 DAYS ---
window.rDormant30 = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let sData = getS();
    let html = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🛌</span> ${L==='ar'?'عملاء خاملين (30 يوم)':'30-Day Dormant'}</h1>
        </div>
        <div class="card" style="margin-top:20px;">
            <div style="overflow-x:auto;">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--bd);">
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'العميل':'Customer'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'آخر فاتورة':'Last Invoice Date'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'أيام الخمول':'Days Dormant'}</th>
                        </tr>
                    </thead>
                    <tbody id="dorm30Tbody"></tbody>
                </table>
            </div>
        </div>
    `;
    let M = document.getElementById('M');
    if(M) M.innerHTML = html;
    
    let tb = document.getElementById('dorm30Tbody');
    if(!tb) return;
    
    let cu = {};
    sData.forEach(r => {
        let c = r.Customer;
        if(!c) return;
        let d = typeof pd === 'function' ? pd((r['Invoice Date'] || r['Order Date'] || r['Date'])) : (r['Invoice Date'] || r['Order Date'] || r['Date']);
        if(d) {
            let dt = new Date(d);
            if(!cu[c] || dt > cu[c]) cu[c] = dt;
        }
    });
    
    let today = new Date();
    let dormants = [];
    Object.entries(cu).forEach(([c, last]) => {
        let days = Math.floor((today - last) / 86400000);
        if(days >= 30) dormants.push({c, last, days});
    });
    
    if(dormants.length === 0) {
        tb.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:30px;color:var(--tx3);">${L==='ar'?'لا يوجد عملاء خاملين.':'No dormant customers.'}</td></tr>`;
        return;
    }
    
    dormants.sort((a,b) => b.days - a.days).forEach(d => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        tr.innerHTML = `
            <td style="padding:15px 10px;font-weight:bold;color:var(--tx1);">${d.c}</td>
            <td style="padding:15px 10px;color:var(--tx2);">${d.last.toISOString().split('T')[0]}</td>
            <td style="padding:15px 10px;"><span style="background:var(--rd);color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;">${d.days} ${L==='ar'?'يوم':'days'}</span></td>
        `;
        tb.appendChild(tr);
    });
};

// --- ALERTS & AUTO EMAIL ---
window.checkDailyAlerts = function() {
    let lastCheck = localStorage.getItem('sp_last_alert_check');
    let today = new Date().toISOString().split('T')[0];
    
    let delayCount = 0;
    let T_data = getT();
    let S_data = getS();
    
    if (T_data.length > 0 && S_data.length > 0) {
        let cuS = {};
        S_data.forEach(r => { let c=r.Customer||''; cuS[c]=(cuS[c]||0)+(typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax']||0)); });
        T_data.forEach(r => {
            let tg=Number(r.Target)||0, ach=cuS[r.Customer]||0, pct=tg>0?ach/tg*100:0;
            if(pct < 50 && tg > 0) delayCount++;
        });
    }
    
    // Check if auto-email was already triggered today
    let mailSentToday = localStorage.getItem('sp_auto_mail_sent') === today;
    
    if (delayCount > 0 && lastCheck !== today) {
        let emailBody = encodeURIComponent(`تنبيه يومي: يوجد ${delayCount} عملاء متأخرين عن تحقيق 50% من المستهدف. يرجى المتابعة العاجلة.`);
        let emailAddress = localStorage.getItem('repEmailInput') || ''; // if they saved an email somewhere
        
        let mailLink = `mailto:${emailAddress}?subject=تنبيه تأخير تارجت العملاء&body=${emailBody}`;
        
        // AUTO SEND EMAIL upon opening if not sent today
        if(!mailSentToday) {
            localStorage.setItem('sp_auto_mail_sent', today);
            
            // Try to trigger the system's checkAndSendDailyReport if it exists (EmailJS/Webhook)
            if(typeof window.checkAndSendDailyReport === 'function') {
                window.checkAndSendDailyReport();
            } else {
                // Otherwise open the default mail client automatically
                window.open(mailLink, '_blank');
            }
        }
        
        let h = `
            <div style="text-align:center;padding:10px;">
                <div style="font-size:3.5rem;margin-bottom:10px;">⚠️</div>
                <h2 style="color:var(--rd);margin:0 0 10px 0;">تنبيه المتأخرات اليومي</h2>
                <p style="margin-bottom:20px;color:var(--tx2);line-height:1.5;">يوجد <strong>${delayCount}</strong> عملاء متأخرين عن تحقيق المستهدف (أقل من 50%). يرجى مراجعة صفحة التنبيهات.</p>
                <div style="display:flex;gap:10px;flex-direction:column;">
                    <button class="sp-btn-primary" onclick="this.closest('.sp-modal-overlay').remove(); if(typeof P!=='undefined'){ P='alerts'; if(typeof buildNav==='function') buildNav(); if(typeof render==='function') render(); }">مراجعة التنبيهات في التطبيق</button>
                    <a href="${mailLink}" target="_blank" class="btn" style="background:var(--bg3);color:var(--tx1);border:1px solid var(--bd);padding:12px;border-radius:8px;text-decoration:none;display:block;">📧 فتح تطبيق الإيميل يدوياً</a>
                </div>
            </div>
        `;
        let m = document.createElement('div');
        m.className = 'sp-modal-overlay';
        m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
        document.body.appendChild(m);
    }
    
    localStorage.setItem('sp_last_alert_check', today);
};

// --- INITIALIZATION HOOKS ---
let oldInit = window.init;
window.init = function() {
    if(oldInit) oldInit();
    setTimeout(window.checkDailyAlerts, 1500);
    setTimeout(window.injectBranchCards, 1500);
};

// --- BRANCH CARDS ---
window.injectBranchCards = function() {
    if(typeof P !== 'undefined' && P === 'dash') {
        let S_data = getS();
        if(S_data.length === 0) return;
        
        let luxorSales = 0, qobbahSales = 0;
        S_data.forEach(s => {
            let val = Number(s['Sales Without Tax'] || 0);
            let c = (s.Customer || '').toLowerCase();
            let ref = (s['Payment Ref.'] || '').toLowerCase();
            if(c.includes('أقصر') || c.includes('اقصر') || c.includes('luxor') || ref.includes('luxor')) {
                luxorSales += val;
            } else {
                qobbahSales += val;
            }
        });
        
        let dashCards = document.querySelector('.kg');
        if(dashCards && !document.getElementById('branchLuxor')) {
            let L = localStorage.getItem('sp_lang') || 'ar';
            let html = `
                <div class="ki" id="branchLuxor" style="border-left: 3px solid var(--ac); background: var(--bg3); cursor:pointer;" onclick="if(typeof P!=='undefined'){ P='dormant30'; if(typeof render==='function') render(); }">
                    <div class="lb">${L==='ar'?'مبيعات الأقصر':'Luxor Sales'}</div>
                    <div class="vl" style="color:var(--tx1);">${typeof fmt==='function'?fmt(luxorSales):luxorSales}</div>
                </div>
                <div class="ki" id="branchQobbah" style="border-left: 3px solid var(--pu); background: var(--bg3); cursor:pointer;" onclick="if(typeof P!=='undefined'){ P='dormant30'; if(typeof render==='function') render(); }">
                    <div class="lb">${L==='ar'?'مبيعات حدائق القبة':'Qobbah Sales'}</div>
                    <div class="vl" style="color:var(--tx1);">${typeof fmt==='function'?fmt(qobbahSales):qobbahSales}</div>
                </div>
            `;
            dashCards.insertAdjacentHTML('beforeend', html);
        }
    }
};

// --- DYNAMIC NAV ---
(function injectNavItems() {
    if (typeof NAV !== 'undefined') {
        if (!NAV.find(n => n.p === 'visits')) {
            let advIdx = NAV.findIndex(n => n.p === 'dormant');
            if (advIdx > -1) {
                NAV.splice(advIdx + 1, 0, {p:'dormant30', ic:'🛌'}, {p:'visits',ic:'🚗'}, {p:'leads',ic:'🤝'});
            } else {
                NAV.push({p:'dormant30', ic:'🛌'}, {p:'visits',ic:'🚗'}, {p:'leads',ic:'🤝'});
            }
        }
    }
})();

let old_buildNav = window.buildNav;
window.buildNav = function() {
    if(old_buildNav) old_buildNav();
    
    setTimeout(() => {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let elVisits = document.querySelector('.ni[data-p="visits"] span:nth-child(2)');
        if(elVisits) elVisits.textContent = L==='ar' ? 'الزيارات' : 'Visits';
        
        let elLeads = document.querySelector('.ni[data-p="leads"] span:nth-child(2)');
        if(elLeads) elLeads.textContent = L==='ar' ? 'محتملين' : 'Leads';
        
        let elCol = document.querySelector('.ni[data-p="collections"] span:nth-child(2)');
        if(elCol) elCol.textContent = L==='ar' ? 'التحصيلات' : 'Collections';
        
        let elDorm = document.querySelector('.ni[data-p="dormant30"] span:nth-child(2)');
        if(elDorm) elDorm.textContent = L==='ar' ? 'خاملين (30 يوم)' : '30-Day Dormant';
    }, 50);
};

let old_render = window.render;
window.render = function() {
    if (typeof P !== 'undefined') {
        if (P === 'visits') { if (typeof buildNav === 'function') buildNav(); rVisits(); return; }
        if (P === 'leads') { if (typeof buildNav === 'function') buildNav(); rLeads(); return; }
        if (P === 'dormant30') { if (typeof buildNav === 'function') buildNav(); window.rDormant30(); return; }
    }
    if (old_render) old_render();
    setTimeout(window.injectBranchCards, 100);
};

// Global Font Size and Family Manager
(function initGlobalFonts() {
    window.sp_fonts = {
        sizes: ['15px', '16px', '18px', '20px'],
        families: ['Tajawal', 'Cairo', 'Almarai', 'Outfit', 'system-ui']
    };
    
    window.applyAppFontSettings = function() {
        let currentSize = parseInt(localStorage.getItem('sp_font_size') || '0');
        let currentFamily = localStorage.getItem('sp_font_family') || 'Tajawal';
        
        if (currentSize >= window.sp_fonts.sizes.length) currentSize = 0;
        
        document.documentElement.style.fontSize = window.sp_fonts.sizes[currentSize];
        document.body.style.fontFamily = "'" + currentFamily + "', system-ui, -apple-system, sans-serif";
    };
    
    window.applyAppFontSettings();
    
    window.setAppFontSize = function(idx) {
        localStorage.setItem('sp_font_size', idx);
        window.applyAppFontSettings();
        if (typeof toast === 'function') toast('?? ????? ??? ????');
    };
    
    window.setAppFontFamily = function(fontName) {
        localStorage.setItem('sp_font_family', fontName);
        window.applyAppFontSettings();
        if (typeof toast === 'function') toast('?? ????? ??? ????');
    };
})();



// ==========================================
// PREMIUM FEATURES INJECTION
// ==========================================

// 1. WhatsApp Integration (Sales)
if (typeof window.fSl === 'function' && !window.whatsappInjected) {
    window.whatsappInjected = true;
    const originalFSl = window.fSl;
    window.fSl = function(data) {
        originalFSl(data);
        setTimeout(() => {
            let sth = document.querySelector('#stb')?.previousElementSibling; // thead
            if (sth) {
                let trh = sth.querySelector('tr');
                if (trh && !trh.querySelector('.wa-th')) {
                    trh.insertAdjacentHTML('beforeend', '<th class="wa-th">💬 واتساب</th>');
                }
            }
            let rows = document.querySelectorAll('#stb tr');
            let st = pState.sales;
            let start = (st.page - 1) * st.limit;
            rows.forEach((tr, idx) => {
                let r = data[start + idx];
                if(r && !tr.querySelector('.wa-btn')) {
                    let s = typeof getSalesVal === 'function' ? getSalesVal(r) : r['Sales After Discount'];
                    let msg = "مرحباً بك عميلنا المميز " + (r.Customer || '') + "، تم تسجيل فاتورة مبيعات لحسابكم بقيمة " + s + " بتاريخ " + ((r['Invoice Date'] || r['Order Date'] || r['Date'])||'') + ". شكراً لتعاملكم معنا!";
                    tr.insertAdjacentHTML('beforeend', '<td><button class="wa-btn" onclick="window.open(\'https://wa.me/?text=' + encodeURIComponent(msg) + '\')" style="background:transparent;border:none;font-size:1.2rem;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.2)\'" onmouseout="this.style.transform=\'scale(1)\'">💬</button></td>');
                }
            });
        }, 50);
    };
}

// 2. WhatsApp Integration (Collections)
const originalRCol = window.rCollections;
if (originalRCol && !window.waColInjected) {
    window.waColInjected = true;
    window.rCollections = function() {
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
                    let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\s+/g, '') === pn.toLowerCase().replace(/\s+/g, '')));
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
                    duesHtml += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid rgba(255,0,0,0.2);"><strong style="color:var(--tx);font-size:0.9rem;">${c}</strong><span class="badge bg-r" style="font-size:0.9rem;">متبقي: ${due.toLocaleString()}</span></div>`;
                }
            });
            
            if(hasDues) {
                let m = document.getElementById('M');
                let ph = m.querySelector('.ph');
                if(ph) {
                    let duesCard = `<div class="card" style="margin-top:15px; border-top:3px solid var(--rd); max-height:250px; overflow-y:auto;">
                        <h3 style="color:var(--rd); margin-bottom:10px; display:flex; align-items:center; gap:8px;">⚠️ تنبيهات المتأخرات (ديون العملاء)</h3>
                        ${duesHtml}
                    </div>`;
                    ph.insertAdjacentHTML('afterend', duesCard);
                }
            }
            // --- End Dues Alerts Logic ---
            
            let trh = document.querySelector('.tb table thead tr');
            if(trh && !trh.querySelector('.wa-th')) {
                trh.insertAdjacentHTML('beforeend', '<th class="wa-th">💬 واتساب</th>');
            }
            let rows = document.querySelectorAll('.tb table tbody tr');
            rows.forEach((tr, idx) => {
                let r = C[idx];
                if(r && !tr.querySelector('.wa-btn')) {
                    let keys = Object.keys(r);
                    let getVal = (possibleNames) => {
                        let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\s+/g, '') === pn.toLowerCase().replace(/\s+/g, '')));
                        return k ? r[k] : undefined;
                    };
                    let rawVal = getVal(['Amount', 'Collection']) || 0;
                    let cName = getVal(['Customer Name', 'Customer']) || '';
                    let d = getVal(['Date']) || '';
                    let msg = "مرحباً " + cName + "، تم استلام دفعة نقدية (تحصيل) بقيمة " + rawVal + " بتاريخ " + d + ". نشكركم لتعاونكم!";
                    tr.insertAdjacentHTML('beforeend', '<td><button class="wa-btn" onclick="window.open(\'https://wa.me/?text=' + encodeURIComponent(msg) + '\')" style="background:transparent;border:none;font-size:1.2rem;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.2)\'" onmouseout="this.style.transform=\'scale(1)\'">💬</button></td>');
                }
            });
        }, 100);
    };
}

// 3. Target Gamification (Confetti & Progress)
const originalRTgt = window.rTgt;
if (originalRTgt && !window.tgtGamInjected) {
    window.tgtGamInjected = true;
    window.rTgt = function() {
        originalRTgt();
        setTimeout(() => {
            let sData = typeof getFilteredSales === 'function' ? getFilteredSales() : S;
            let sMap = {}; sData.forEach(r => sMap[r.Customer||''] = (sMap[r.Customer||'']||0) + (typeof getSalesVal === 'function' ? getSalesVal(r) : 0));
            let tTot = 0, aTot = 0;
            T.forEach(r => {
                let val = Number(r.Target||r.target||0);
                let cName = r['Customer Name']||r['Customer']||'';
                tTot += val;
                aTot += (sMap[cName]||0);
            });
            let perc = tTot > 0 ? (aTot / tTot) * 100 : 0;
            
            let m = document.getElementById('M');
            if(!m) return;
            let pgHTML = '<div style="background:var(--bg3); border-radius:12px; padding:20px; margin:20px 0; border:1px solid var(--bd); position:relative; overflow:hidden;">' +
                         '<h3 style="margin-bottom:12px; text-align:center;">🏆 نسبة تحقيق التارجت الإجمالي 🏆</h3>' +
                         '<div style="background:var(--bg); border-radius:20px; height:24px; width:100%; overflow:hidden; box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">' +
                         '<div style="background:linear-gradient(90deg, #f5af19, #f12711); height:100%; width:' + Math.min(perc, 100) + '%; transition:width 1s; display:flex; align-items:center; justify-content:flex-end; padding-right:10px; color:white; font-weight:bold; font-size:0.8rem;">' +
                         perc.toFixed(1) + '%' +
                         '</div></div>';
                         
            if(perc >= 100) {
                pgHTML += '<div style="text-align:center; margin-top:10px; color:#2ecc71; font-weight:bold;">🎉 مبروك! لقد حققت التارجت المطلوب! 🎉</div>';
            } else {
                pgHTML += '<div style="text-align:center; margin-top:10px; color:var(--tx2); font-size:0.85rem;">متبقي ' + Math.max(0, tTot - aTot).toLocaleString() + ' للوصول للهدف 🚀</div>';
            }
            pgHTML += '</div>';
            
            let ph = m.querySelector('.ph');
            if (ph) {
                ph.insertAdjacentHTML('afterend', pgHTML);
            }
            
            if (perc >= 100 && typeof confetti === 'function') {
                confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
            }
        }, 100);
    };
}

// 4. Premium Analytics Dashboard

window.rAn = function() {
    let ds = typeof getFilteredSales === 'function' ? getFilteredSales() : (typeof S !== 'undefined' ? S : []);
    
    // Function to calculate and render for a specific month
    let renderMonth = (year, month) => {
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        let daysMap = {};
        for(let i=1; i<=daysInMonth; i++) daysMap[i] = 0;
        
        let dsTop = {};
        let dsClass = {'إكسسوارات':0, 'هاردوير':0, 'أخرى':0};
        let dsRegion = {};
        let dsItems = {};

        ds.forEach(r => {
            let valForItems = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
            let itmDesc = r['Item Description'] || 'غير محدد';
            dsItems[itmDesc] = (dsItems[itmDesc] || 0) + valForItems;

            let val = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
            let rDateRaw = r['Invoice Date'] || (r['Invoice Date'] || r['Order Date'] || r['Date']) || r['Date'];
            let rDateStr = typeof pd === 'function' ? pd(rDateRaw) : rDateRaw; 
            if(rDateStr) {
                let rDate = new Date(rDateStr);
                if(!isNaN(rDate) && rDate.getMonth() === month && rDate.getFullYear() === year) {
                    daysMap[rDate.getDate()] += val;
                }
            }
            
            let c = r.Customer || 'Unknown';
            dsTop[c] = (dsTop[c] || 0) + val;
            
            let cls = r['Item Class Name'] || '';
            if(typeof isAcc === 'function' && isAcc(cls)) dsClass['إكسسوارات'] += val;
            else if(typeof isHW === 'function' && isHW(cls)) dsClass['هاردوير'] += val;
            else dsClass['أخرى'] += val;
            
            let reg = r['Customer Class'] || 'Unknown';
            dsRegion[reg] = (dsRegion[reg] || 0) + val;
        });
        return { daysMap, dsTop, dsClass, dsRegion, dsItems };
    };

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let { daysMap, dsTop, dsClass, dsRegion, dsItems } = renderMonth(currentYear, currentMonth);

    let topCats = Object.entries(dsTop).sort((a,b)=>b[1]-a[1]).slice(0,5);
    let classArr = Object.entries(dsClass).filter(x => x[1] > 0);
    let regArr = Object.entries(dsRegion).sort((a,b)=>b[1]-a[1]).slice(0,5);
    
    let allItemsArr = Object.entries(dsItems || {}).sort((a,b)=>b[1]-a[1]);
    let topItems = allItemsArr.slice(0, 10);
    let bottomItems = allItemsArr.slice(-10).reverse();

    let m = document.getElementById('M');
    
    let monthVal = currentYear + '-' + String(currentMonth + 1).padStart(2, '0');

    // Calculate required daily target based on working days left
    let totalTarget = typeof T !== 'undefined' ? T.reduce((sum, r) => sum + (Number(r.Target)||0), 0) : 0;
    let totalSales = ds.reduce((sum, r) => sum + (typeof getSalesVal === 'function' ? getSalesVal(r) : 0), 0);
    let todayDate = new Date();
    let daysInCurrentMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
    let workingDaysLeft = 0;
    for(let i = todayDate.getDate(); i <= daysInCurrentMonth; i++) {
        let d = new Date(todayDate.getFullYear(), todayDate.getMonth(), i);
        if(d.getDay() !== 5) workingDaysLeft++; // Excluding Fridays (5)
    }
    let remainingTarget = Math.max(0, totalTarget - totalSales);
    let dailyRequired = workingDaysLeft > 0 ? (remainingTarget / workingDaysLeft) : remainingTarget;
    
    // AI Restock Predictor (Customers who might need restock today)
    let restockAlerts = [];
    if(typeof S !== 'undefined') {
        let cuFreq = {};
        S.forEach(r => { 
            let c=r.Customer||''; 
            if(!cuFreq[c]) cuFreq[c] = {dates:[], last:null};
            let d=pd(r['Invoice Date'] || r['Order Date'] || r['Date']); 
            if(d) {
                let dTime = new Date(d).getTime();
                if(!isNaN(dTime)) cuFreq[c].dates.push(dTime);
            }
        });
        Object.entries(cuFreq).forEach(([c, data]) => {
            if(data.dates.length > 2) {
                data.dates.sort((a,b)=>a-b);
                let diffs = [];
                for(let i=1; i<data.dates.length; i++) {
                    diffs.push(data.dates[i] - data.dates[i-1]);
                }
                let avgDiff = diffs.reduce((a,b)=>a+b,0) / diffs.length;
                let lastOrder = data.dates[data.dates.length-1];
                let daysSinceLast = (todayDate.getTime() - lastOrder) / 86400000;
                let avgDays = avgDiff / 86400000;
                if(avgDays > 3 && daysSinceLast >= (avgDays - 2) && daysSinceLast <= (avgDays + 3)) {
                    restockAlerts.push({c, avgDays: Math.round(avgDays)});
                }
            }
        });
    }
    let restockHTML = restockAlerts.length > 0 ? 
        restockAlerts.slice(0,3).map(a => `<div style="font-size:0.85rem; color:var(--am);"><span style="font-size:1rem;">⚠️</span> العميل <b>${a.c}</b> قد يحتاج لطلب بضاعة اليوم (متوسط الشراء كل ${a.avgDays} يوم)</div>`).join('') :
        `<div style="font-size:0.85rem; color:var(--gn);"><span style="font-size:1rem;">✅</span> لا يوجد نواقص متوقعة لعملائك اليوم.</div>`;

    m.innerHTML = '<div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">📊</span> إحصائيات المبيعات</h1></div>' +
        '<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top:20px;">' +
        
        // Micro-targeting Widget
        '<div class="card" style="padding:20px; width:100%; border-left: 4px solid var(--p); background: var(--bg2);">' +
        '<h3 style="margin-bottom:10px; color:var(--p);">🎯 الهدف اليومي المطلوب (تكسير التارجت)</h3>' +
        `<div style="font-size:1.8rem; font-weight:bold; margin-bottom:10px;">${fmt(dailyRequired)} ج.م</div>` +
        `<div style="font-size:0.9rem; color:var(--tx2);">المتبقي من الهدف الشهري: ${fmt(remainingTarget)} | أيام العمل المتبقية: ${workingDaysLeft} يوم</div>` +
        '</div>' +
        
        // AI Predictor Widget
        '<div class="card" style="padding:20px; width:100%; border-left: 4px solid var(--am); background: var(--bg2);">' +
        '<h3 style="margin-bottom:10px; color:var(--am);">🤖 توقعات نفاد المخزون (الذكاء الاصطناعي)</h3>' +
        `<div style="display:flex; flex-direction:column; gap:8px;">${restockHTML}</div>` +
        '</div>' +
        '</div>' +
        
        '<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top:20px;">' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">' +
        '<h3>📈 المبيعات اليومية</h3>' +
        '<input type="month" id="anMonthSel" value="' + monthVal + '" style="padding:6px; border-radius:6px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-family:Cairo;">' +
        '</div>' +
        '<div style="height:450px; width:100%;"><canvas id="premChart1"></canvas></div></div>' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">🏆 أفضل 5 عملاء (الإجمالي)</h3>' +
        '<div style="height:450px; width:100%;"><canvas id="premChart2"></canvas></div></div>' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">🎧 إكسسوارات مقابل هاردوير 📱</h3>' +
        '<div style="height:450px; width:100%;"><canvas id="premChart3"></canvas></div></div>' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">📍 مبيعات المناطق</h3>' +
        '<div style="height:450px; width:100%;"><canvas id="premChart4"></canvas></div></div>' +
        
        '</div>' +
        '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top:20px;">' +
        '<div class="card" style="padding:20px; width:100%; border-top:4px solid var(--gn); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">أفضل 10 أصناف مبيعاً</h3>' +
        topItems.map(x => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bd);font-size:0.9rem;"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:15px;" title="${x[0]}">${x[0]}</span><strong style="color:var(--gn); font-size:0.95rem;">${typeof fmt==='function'?fmt(x[1]):x[1]}</strong></div>`).join('') +
        '</div>' +
        '<div class="card" style="padding:20px; width:100%; border-top:4px solid var(--rd); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">أقل 10 أصناف مبيعاً</h3>' +
        bottomItems.map(x => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--bd);font-size:0.9rem;"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:15px;" title="${x[0]}">${x[0]}</span><strong style="color:var(--rd); font-size:0.95rem;">${typeof fmt==='function'?fmt(x[1]):x[1]}</strong></div>`).join('') +
        '</div>' +
        '</div>';

    setTimeout(() => {
        let ctx1 = document.getElementById('premChart1');
        let ctx2 = document.getElementById('premChart2');
        let ctx3 = document.getElementById('premChart3');
        let ctx4 = document.getElementById('premChart4');
        
        let colors = ['#0f9d58', '#4285F4', '#f4b400', '#db4437', '#9c27b0', '#00bcd4', '#ff9800'];
        
        let chart1;
        
        let labelConf = {
            color: '#fff',
            font: { weight: 'bold', size: 14, family: 'Cairo' },
            textStrokeColor: 'rgba(0,0,0,0.5)',
            textStrokeWidth: 3,
            display: function(ctx) {
                let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                let v = dataset.data[ctx.dataIndex];
                if (!v || v <= 0) return false;
                
                // If it's a pie/doughnut chart, hide labels for slices < 5% to prevent overlap
                if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                    let total = dataset.data.reduce((a, b) => a + b, 0);
                    if ((v / total) < 0.05) return false;
                }
                return 'auto';
            },
            formatter: function(v) {
                if (!v || v === 0) return '';
                if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                return v;
            }
        };

        if(ctx1) {
            chart1 = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: Object.keys(daysMap),
                    datasets: [{
                        label: 'المبيعات',
                        data: Object.values(daysMap),
                        backgroundColor: '#4285F4',
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '45%', layout: { padding: 15 }, plugins: { datalabels: labelConf } }
            });
        }
        
        // Month Selector Event Listener
        let mSel = document.getElementById('anMonthSel');
        if(mSel && chart1) {
            mSel.addEventListener('change', (e) => {
                if(!e.target.value) return;
                let parts = e.target.value.split('-');
                let y = parseInt(parts[0]);
                let m = parseInt(parts[1]) - 1; // 0-indexed
                let { daysMap: newDaysMap } = renderMonth(y, m);
                chart1.data.labels = Object.keys(newDaysMap);
                chart1.data.datasets[0].data = Object.values(newDaysMap);
                chart1.update();
            });
        }

        if(ctx2) {
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: topCats.map(x => x[0]),
                    datasets: [{
                        data: topCats.map(x => x[1]),
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '45%', layout: { padding: 15 }, plugins: { datalabels: labelConf, legend: { position: 'right' } } }
            });
        }
        if(ctx3) {
            new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: classArr.map(x => x[0]),
                    datasets: [{
                        data: classArr.map(x => x[1]),
                        backgroundColor: ['#9c27b0', '#0f9d58', '#607d8b'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '45%', layout: { padding: 15 }, plugins: { datalabels: labelConf, legend: { position: 'bottom' } } }
            });
        }
        if(ctx4) {
            new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: regArr.map(x => x[0]),
                    datasets: [{
                        data: regArr.map(x => x[1]),
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '45%', layout: { padding: 15 }, plugins: { datalabels: labelConf, legend: { position: 'right' } } }
            });
        }
    }, 100);
};


// 5. GPS Check-in for Visits
const originalRVisits = window.rVisits;
if (originalRVisits && !window.gpsInjected) {
    window.gpsInjected = true;
    window.rVisits = function() {
        originalRVisits();
        setTimeout(() => {
            let addBtn = document.querySelector('#M .card .btn-p');
            if (addBtn && addBtn.innerText.includes('تسجيل')) {
                addBtn.removeAttribute('onclick');
                addBtn.onclick = () => {
                    let c = document.getElementById('vCust').value;
                    let n = document.getElementById('vNotes').value;
                    if(!c) return typeof toast === 'function' ? toast('اختر العميل أولاً', 'error') : alert('اختر العميل');
                    
                    addBtn.innerText = 'جاري تحديد الموقع...';
                    addBtn.style.opacity = '0.5';
                    addBtn.disabled = true;

                    let saveWithLoc = (lat, lng) => {
                        let visits = JSON.parse(localStorage.getItem('sp_visits')||'[]');
                        visits.unshift({ c: c, n: n, d: new Date().toISOString(), lat: lat, lng: lng });
                        localStorage.setItem('sp_visits', JSON.stringify(visits));
                        if(typeof toast === 'function') toast('تم تسجيل الزيارة بنجاح', 'success');
                        window.rVisits();
                    };

                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            pos => saveWithLoc(pos.coords.latitude, pos.coords.longitude),
                            err => {
                                console.log(err);
                                if(typeof toast === 'function') toast('فشل تحديد الموقع، تم الحفظ بدون موقع', 'error');
                                saveWithLoc(null, null);
                            },
                            { timeout: 5000 }
                        );
                    } else {
                        saveWithLoc(null, null);
                    }
                };
            }
            let tbody = document.querySelector('.tb table tbody');
            if(tbody) {
                let visits = JSON.parse(localStorage.getItem('sp_visits')||'[]');
                let h = '';
                visits.forEach((v, i) => {
                    let d = new Date(v.d).toLocaleString('ar-EG');
                    let mapLink = (v.lat && v.lng) ? '<a href="https://maps.google.com/?q=' + v.lat + ',' + v.lng + '" target="_blank" class="badge bg-g" style="text-decoration:none; display:inline-block; padding:4px 8px;">🗺️ عرض الموقع</a>' : '<span style="color:var(--tx2);font-size:0.8rem;">لا يوجد موقع</span>';
                    h += '<tr><td>' + d + '</td><td>' + v.c + '</td><td>' + (v.n||'') + '</td><td>' + mapLink + '</td><td><button class="btn bg-r" style="padding:4px 8px;font-size:0.8rem;" onclick="deleteVisit(' + i + ')">حذف</button></td></tr>';
                });
                tbody.innerHTML = h;
                
                let trh = document.querySelector('.tb table thead tr');
                if (trh && !trh.innerHTML.includes('الموقع')) {
                    let lastTh = trh.lastElementChild;
                    trh.removeChild(lastTh);
                    trh.insertAdjacentHTML('beforeend', '<th>الموقع 🗺️</th><th>إجراء</th>');
                }
            }
        }, 100);
    };
    
    window.deleteVisit = function(i) {
        if(confirm('هل أنت متأكد من الحذف؟')) {
            let visits = JSON.parse(localStorage.getItem('sp_visits')||'[]');
            visits.splice(i, 1);
            localStorage.setItem('sp_visits', JSON.stringify(visits));
            window.rVisits();
        }
    };
}



// --- PHASE 2: SALES INTELLIGENCE & RFM ---
if (typeof I !== 'undefined') I['intel'] = {ar: 'ذكاء البيع', en: 'Sales Intel'};
if (typeof NAV !== 'undefined' && !NAV.find(x => x.p === 'intel')) {
    let idx = NAV.findIndex(x => x.p === 'prospects');
    if(idx > -1) NAV.splice(idx + 1, 0, {p: 'intel', ic: '🧠'});
    else NAV.push({p: 'intel', ic: '🧠'});
}
if (typeof BNV !== 'undefined' && !BNV.includes('intel')) {
    let bIdx = BNV.indexOf('prospects');
    if(bIdx > -1) BNV.splice(bIdx + 1, 0, 'intel');
}

// Monkey patch render
if (typeof window.originalRenderForIntel === 'undefined' && typeof window.render === 'function') {
    window.originalRenderForIntel = window.render;
    window.render = function() {
        if(typeof P !== 'undefined' && P === 'intel') {
            if (typeof window.rIntel === 'function') window.rIntel();
            if (typeof window.initAnm === 'function') window.initAnm();
            if (typeof window.enhanceUI === 'function') setTimeout(window.enhanceUI, 50);
        } else {
            window.originalRenderForIntel();
        }
    };
}

window.rIntel = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let sData = typeof getFilteredSales === 'function' ? getFilteredSales() : (typeof getS === 'function' ? getS() : []);
    
    // 1. Cross-Sell Engine
    let cMap = {};
    sData.forEach(r => {
        let c = r.Customer; if(!c) return;
        let s = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
        let isA = typeof window.isAcc === 'function' ? window.isAcc(r['Item Class Name']) : false;
        let isH = typeof window.isHW === 'function' ? window.isHW(r['Item Class Name']) : false;
        
        if(!cMap[c]) cMap[c] = {hw:0, acc:0, total:0, phone: r.Phone||r['رقم الموبايل']||r.phone||''};
        cMap[c].total += s;
        if(isH) cMap[c].hw += s;
        if(isA) cMap[c].acc += s;
        if(!cMap[c].phone && (r.Phone || r['رقم الموبايل'] || r.phone)) cMap[c].phone = r.Phone || r['رقم الموبايل'] || r.phone;
    });

    let crossSell = [];
    Object.keys(cMap).forEach(c => {
        let d = cMap[c];
        if (d.hw > 1000 && d.acc === 0) {
            crossSell.push({c: c, type: 'hw_no_acc', opp: L==='ar'?'يشتري هاردوير ولا يشتري إكسسوارات':'Buys HW, no Acc', phone: d.phone});
        } else if (d.acc > 1000 && d.hw === 0) {
            crossSell.push({c: c, type: 'acc_no_hw', opp: L==='ar'?'يشتري إكسسوارات ولا يشتري هاردوير':'Buys Acc, no HW', phone: d.phone});
        }
    });

    let crossHTML = crossSell.map(x => {
        let msg = L==='ar' ? 'أهلاً بك، لاحظنا أنك من عملائنا المميزين، ولدينا عرض خاص لك اليوم على المنتجات التي قد تهمك.' : 'Hello, as a valued customer, we have a special offer for you today!';
        let btn = `<button onclick="window.open('https://wa.me/2${x.phone.replace(/\\D/g,'')}?text=${encodeURIComponent(msg)}', '_blank')" class="btn" style="background:#25D366;color:#fff;padding:4px 8px;font-size:0.8rem;border:none;">WhatsApp</button>`;
        return `<tr>
            <td><strong>${x.c}</strong></td>
            <td><span style="color:var(--ac);font-size:0.85rem;">${x.opp}</span></td>
            <td>${x.phone ? btn : '<span style="color:var(--tx3);">-</span>'}</td>
        </tr>`;
    }).join('');

    // 2. RFM Score
    let rfmMap = {};
    let now = new Date();
    sData.forEach(r => {
        let c = r.Customer; if(!c) return;
        let s = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
        let dStr = r.Date || r['التاريخ'] || r['Invoice Date'];
        let dt = dStr ? new Date(dStr) : now;
        
        if(!rfmMap[c]) rfmMap[c] = {lastDate: dt, freq: 0, total: 0};
        if(dt > rfmMap[c].lastDate) rfmMap[c].lastDate = dt;
        rfmMap[c].freq += 1;
        rfmMap[c].total += s;
    });

    let rfmArr = Object.keys(rfmMap).map(c => {
        let d = rfmMap[c];
        let days = Math.floor((now - d.lastDate)/(1000*60*60*24));
        let score = 'Dormant';
        let color = 'var(--rd)';
        if (days <= 30 && d.total > 5000) { score = 'VIP'; color = 'var(--gn)'; }
        else if (days > 30 && days <= 60) { score = 'At Risk'; color = 'var(--am)'; }
        else if (days <= 30) { score = 'Active'; color = '#2196f3'; }
        
        return {c: c, days: days, freq: d.freq, total: d.total, score: score, color: color};
    }).sort((a,b) => b.total - a.total);

    let rfmHTML = rfmArr.map(x => `
        <tr>
            <td><strong>${x.c}</strong></td>
            <td>${typeof window.fmt==='function'?window.fmt(x.total):x.total}</td>
            <td>${x.freq}</td>
            <td>${x.days} ${L==='ar'?'يوم':'days'}</td>
            <td><span class="badge" style="background:${x.color};color:#fff;">${L==='ar' && x.score==='VIP'?'VIP': L==='ar' && x.score==='At Risk'?'في خطر': L==='ar' && x.score==='Active'?'نشط': L==='ar' && x.score==='Dormant'?'خامل': x.score}</span></td>
        </tr>
    `).join('');

    let mDiv = document.getElementById('M');
    if(!mDiv) return;
    mDiv.innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🧠</span> ${L==='ar'?'ذكاء المبيعات (Sales Intel)':'Sales Intelligence'}</h1>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:20px; margin-top:20px;">
            
            <div style="flex:1; min-width:300px; background:var(--bg2); padding:20px; border-radius:12px; border:1px solid var(--bd);">
                <h3 style="color:#ff9800; margin-bottom:15px; border-bottom:2px solid #ff9800; padding-bottom:10px;">${L==='ar'?'محرك البيع المتقاطع (Cross-Sell)':'Cross-Sell Engine'}</h3>
                <p style="font-size:0.9rem; color:var(--tx2); margin-bottom:15px;">${L==='ar'?'عملاء يشترون فئة معينة ويتجاهلون الأخرى، فرصة ذهبية لعرض منتجاتك عليهم!':'Customers who buy one category but ignore the other. Great upsell opportunity!'}</p>
                <div class="tbs" style="max-height: 400px; overflow-y: auto;">
                    <table style="width:100%; text-align:left; border-collapse:collapse; white-space:nowrap;">
                        <thead><tr><th>${L==='ar'?'العميل':'Customer'}</th><th>${L==='ar'?'الفرصة':'Opportunity'}</th><th>${L==='ar'?'إجراء':'Action'}</th></tr></thead>
                        <tbody>${crossHTML || `<tr><td colspan="3" style="text-align:center;">${L==='ar'?'لا توجد بيانات':'No data'}</td></tr>`}</tbody>
                    </table>
                </div>
            </div>

            <div style="flex:1; min-width:300px; background:var(--bg2); padding:20px; border-radius:12px; border:1px solid var(--bd);">
                <h3 style="color:#2196f3; margin-bottom:15px; border-bottom:2px solid #2196f3; padding-bottom:10px;">${L==='ar'?'تقييم العملاء (RFM Score)':'Customer RFM Score'}</h3>
                <p style="font-size:0.9rem; color:var(--tx2); margin-bottom:15px;">${L==='ar'?'تصنيف العملاء حسب حداثة وتكرار وحجم الشراء.':'Customer ranking based on Recency, Frequency, and Monetary value.'}</p>
                <div class="tbs" style="max-height: 400px; overflow-y: auto;">
                    <table style="width:100%; text-align:left; border-collapse:collapse; white-space:nowrap;">
                        <thead><tr>
                            <th>${L==='ar'?'العميل':'Customer'}</th>
                            <th>${L==='ar'?'المبيعات':'Sales'}</th>
                            <th>${L==='ar'?'المرات':'Freq'}</th>
                            <th>${L==='ar'?'آخر شراء':'Last'}</th>
                            <th>${L==='ar'?'التصنيف':'Score'}</th>
                        </tr></thead>
                        <tbody>${rfmHTML || `<tr><td colspan="5" style="text-align:center;">${L==='ar'?'لا توجد بيانات':'No data'}</td></tr>`}</tbody>
                    </table>
                </div>
            </div>

        </div>
    `;
};

// --- PHASE 4: ADVANCED CRM & ANALYTICS ---

// 1. Hook into Render Cycle safely
let phase4OldRender = window.render;
window.render = function() {
    if (typeof phase4OldRender === 'function') phase4OldRender();
    setTimeout(window.enhancePhase4, 60);
};

window.enhancePhase4 = function() {
    let p = typeof P !== 'undefined' ? P : '';
    
    // A. Goal Tracking Dashboards
    if (p === 'dashboard' || p === 'dash') {
        if (!document.getElementById('phase4_goals')) {
            let kg = document.querySelector('.kg');
            if (kg) {
                let hA = 0, aA = 0, hT = 0, aT = 0;
                let L = localStorage.getItem('sp_lang') || 'ar';
                let sData = typeof getS==='function'?getS():(window.S||[]);
                let tData = typeof getT==='function'?getT():(window.T||[]);
                
                sData.forEach(s => {
                    let v = Number(s['Sales Without Tax']||s['Total']||0);
                    let isH = typeof window.isHW==='function' ? window.isHW(s['Item Class Name']) : false;
                    let isA = typeof window.isAcc==='function' ? window.isAcc(s['Item Class Name']) : false;
                    if (isH) hA += v;
                    if (isA) aA += v;
                });
                
                tData.forEach(t => {
                    hT += Number(t.hwTarget||0);
                    aT += Number(t.accTarget||0);
                });
                
                // Fallback to total target logic if explicit hw/acc missing
                if (hT === 0 && aT === 0) {
                    let tt = 0; tData.forEach(t => tt += Number(t.Target||0));
                    hT = tt * 0.7; aT = tt * 0.3;
                }
                
                let hp = hT > 0 ? (hA/hT)*100 : 0;
                let ap = aT > 0 ? (aA/aT)*100 : 0;
                
                let div = document.createElement('div');
                div.id = 'phase4_goals';
                div.style.cssText = 'background:var(--bg2);padding:20px;border-radius:12px;margin-bottom:20px;box-shadow:var(--sh-md);border:1px solid var(--bd);width:100%; animation: fadeUp 0.5s ease-out;';
                div.innerHTML = `
                    <h3 style="margin-bottom:15px;display:flex;align-items:center;gap:8px;">🎯 ${L==='ar'?'تحقيق أهداف الأقسام':'Department Target Achievement'}</h3>
                    
                    <div style="margin-bottom:15px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span style="font-weight:bold;color:#ff9800;">💻 ${L==='ar'?'الهاردوير':'Hardware'}</span>
                            <span style="font-size:0.9rem;">${typeof window.fmt==='function'?window.fmt(hA):hA} / ${typeof window.fmt==='function'?window.fmt(hT):hT} (${hp.toFixed(1)}%)</span>
                        </div>
                        <div style="height:14px;background:var(--bg3);border-radius:7px;overflow:hidden;border:1px solid var(--bd-s);box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);">
                            <div style="width:${Math.min(hp,100)}%;height:100%;background:linear-gradient(90deg, #ffb74d, #ff9800);border-radius:7px;transition:width 1s ease;"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span style="font-weight:bold;color:#e91e63;">🎧 ${L==='ar'?'الإكسسوارات':'Accessories'}</span>
                            <span style="font-size:0.9rem;">${typeof window.fmt==='function'?window.fmt(aA):aA} / ${typeof window.fmt==='function'?window.fmt(aT):aT} (${ap.toFixed(1)}%)</span>
                        </div>
                        <div style="height:14px;background:var(--bg3);border-radius:7px;overflow:hidden;border:1px solid var(--bd-s);box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);">
                            <div style="width:${Math.min(ap,100)}%;height:100%;background:linear-gradient(90deg, #f48fb1, #e91e63);border-radius:7px;transition:width 1s ease;"></div>
                        </div>
                    </div>
                `;
                kg.parentNode.insertBefore(div, kg);
            }
        }
    }
    
    // B. Follow-ups & Quotes in Leads/Prospects
    if (p === 'prospects' || p === 'leads') {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let thead = document.querySelector('#M table thead tr');
        let tbody = document.querySelector('#M table tbody');
        
        if (thead && tbody && !thead.hasAttribute('data-ph4')) {
            thead.setAttribute('data-ph4', '1');
            
            // Add Follow up column to header
            let th = document.createElement('th');
            th.textContent = L==='ar'?'المتابعة':'Follow-up';
            th.style.cssText = 'padding:15px 10px;color:var(--tx2);';
            // Insert before the last column (Action)
            thead.insertBefore(th, thead.lastElementChild);
            
            // Re-render rows
            Array.from(tbody.children).forEach(tr => {
                let nameCell = tr.querySelector('td:first-child');
                if(!nameCell) return;
                let cName = nameCell.textContent.trim();
                
                let leads = JSON.parse(localStorage.getItem('leadsData') || '[]');
                let ld = leads.find(l => l.name === cName) || {};
                
                let tdF = document.createElement('td');
                tdF.style.cssText = 'padding:15px 10px;';
                let fDate = ld.followUp || '';
                let isDue = false;
                if (fDate) {
                    let d = new Date(fDate);
                    let today = new Date();
                    today.setHours(0,0,0,0);
                    if (d <= today) isDue = true;
                }
                
                let dpId = 'fdate_' + Math.random().toString(36).substr(2,9);
                tdF.innerHTML = `
                    <input type="date" id="${dpId}" value="${fDate}" style="padding:4px 8px;font-size:0.8rem;border-radius:6px;border:1px solid ${isDue?'#ef4444':'var(--bd)'};background:var(--bg);color:${isDue?'#ef4444':'var(--tx1)'};font-weight:${isDue?'bold':'normal'};outline:none;" onchange="window.saveLeadFollowUp('${cName}', this.value)">
                `;
                tr.insertBefore(tdF, tr.lastElementChild);
                
                // Add Quote Button
                let actionTd = tr.lastElementChild;
                if (actionTd) {
                    let btnWrap = actionTd.querySelector('div') || actionTd;
                    if (!btnWrap.innerHTML.includes('generateQuote')) {
                        let btn = document.createElement('button');
                        btn.className = 'btn';
                        btn.style.cssText = 'background:#8b5cf6; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem; margin-left:4px; margin-right:4px; border:none; cursor:pointer;';
                        btn.textContent = L==='ar'?'تسعير':'Quote';
                        btn.onclick = () => { if(typeof window.generateQuote==='function') window.generateQuote(cName); };
                        btnWrap.appendChild(btn);
                    }
                }
            });
        }
        
        // Kanban Cards (index.html rPros)
        let kCards = document.querySelectorAll('.card[style*="border-right"]');
        kCards.forEach(card => {
            if (card.hasAttribute('data-ph4')) return;
            card.setAttribute('data-ph4', '1');
            
            let nameDiv = card.querySelector('div:first-child');
            if(!nameDiv) return;
            let cName = nameDiv.textContent.trim();
            
            let leads = JSON.parse(localStorage.getItem('leadsData') || '[]');
            let ld = leads.find(l => l.name === cName) || {};
            
            let fDate = ld.followUp || '';
            let isDue = false;
            if (fDate) {
                let d = new Date(fDate);
                let today = new Date();
                today.setHours(0,0,0,0);
                if (d <= today) isDue = true;
            }
            
            let btnsRow = card.lastElementChild;
            if (btnsRow && btnsRow.style.display.includes('flex')) {
                // inject follow up row before btnsRow
                let fRow = document.createElement('div');
                fRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:0.85rem;';
                
                let dpId = 'fdate_' + Math.random().toString(36).substr(2,9);
                fRow.innerHTML = `
                    <span style="color:var(--tx2);">${L==='ar'?'المتابعة:':'Follow-up:'}</span>
                    <input type="date" id="${dpId}" value="${fDate}" style="padding:4px; border-radius:4px; border:1px solid ${isDue?'#ef4444':'var(--bd)'}; background:var(--bg); color:${isDue?'#ef4444':'var(--tx1)'}; font-weight:${isDue?'bold':'normal'}; width:120px;" onchange="window.saveLeadFollowUp('${cName}', this.value)">
                `;
                card.insertBefore(fRow, btnsRow);
                
                // inject Quote button in btnsRow
                let qBtn = document.createElement('button');
                qBtn.className = 'btn';
                qBtn.style.cssText = 'flex:1; background:#8b5cf6; color:#fff; padding:6px; border:none; border-radius:4px; display:flex; justify-content:center; align-items:center; min-width:40px;';
                qBtn.textContent = 'PDF';
                qBtn.onclick = () => { if(typeof window.generateQuote==='function') window.generateQuote(cName); };
                btnsRow.insertBefore(qBtn, btnsRow.firstElementChild); // insert before whatsapp
                
                // inject Profile button
                let pBtn = document.createElement('button');
                pBtn.className = 'btn btn-p';
                pBtn.style.cssText = 'flex:1; padding:6px; border:none; border-radius:4px; display:flex; justify-content:center; align-items:center; min-width:40px;';
                pBtn.textContent = '👤';
                pBtn.onclick = () => { if(typeof window.openCustomerProfile==='function') window.openCustomerProfile(cName); };
                btnsRow.insertBefore(pBtn, btnsRow.firstElementChild);
            }
        });
        
        // Add Map Button safely
        let ph = document.querySelector('#M .ph');
        if (ph && !ph.querySelector('.hm-btn')) {
            let actionsWrap = ph.querySelector('div[style*="display:flex;gap:10px"]');
            
            let btn = document.createElement('button');
            btn.className = 'btn bg-p hm-btn';
            btn.style.cssText = 'color:#fff;border:none;background:#f43f5e;';
            btn.innerHTML = '🗺️ ' + (L==='ar'?'الخريطة الحرارية':'Heatmap');
            btn.onclick = window.openSalesHeatmap;
            
            if (actionsWrap) {
                actionsWrap.style.flexWrap = 'wrap'; // Fix overflow
                actionsWrap.insertBefore(btn, actionsWrap.firstChild);
            } else {
                ph.appendChild(btn);
            }
        }
    }
    
    // C. Update Badges
    window.updateFollowUpBadge();
};

window.saveLeadFollowUp = function(name, dateStr) {
    let leads = JSON.parse(localStorage.getItem('leadsData') || '[]');
    let idx = leads.findIndex(l => l.name === name);
    if(idx > -1) {
        leads[idx].followUp = dateStr;
        localStorage.setItem('leadsData', JSON.stringify(leads));
        window.updateFollowUpBadge();
        if (typeof toast === 'function') toast(localStorage.getItem('sp_lang')==='ar'?'تم الحفظ':'Saved');
        
        // Update input style if due
        let d = new Date(dateStr);
        let today = new Date();
        today.setHours(0,0,0,0);
        let isDue = (d <= today);
        let input = document.querySelector(`input[onchange*="${name}"]`);
        if (input) {
            input.style.borderColor = isDue ? '#ef4444' : 'var(--bd)';
            input.style.color = isDue ? '#ef4444' : 'var(--tx1)';
            input.style.fontWeight = isDue ? 'bold' : 'normal';
        }
    }
};

window.updateFollowUpBadge = function() {
    let leads = JSON.parse(localStorage.getItem('leadsData') || '[]');
    let dueCount = 0;
    let today = new Date();
    today.setHours(0,0,0,0);
    
    leads.forEach(l => {
        if(l.followUp) {
            let d = new Date(l.followUp);
            if (d <= today && l.status !== 'Customer') dueCount++;
        }
    });
    
    let el = document.querySelector('.ni[data-p="prospects"]');
    if (!el) el = document.querySelector('.ni[data-p="leads"]');
    
    if (el) {
        let b = el.querySelector('.f-badge');
        if (dueCount > 0) {
            if(!b) {
                b = document.createElement('span');
                b.className = 'f-badge';
                b.style.cssText = 'background:#ef4444;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:bold;margin-left:auto;margin-right:auto;box-shadow:0 0 5px rgba(239,68,68,0.5);';
                el.appendChild(b);
            }
            b.textContent = dueCount;
        } else if (b) {
            b.remove();
        }
    }
};

// Heatmap Integration
window.openSalesHeatmap = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let mDiv = document.getElementById('M');
    mDiv.innerHTML = `
        <div class="ph" style="display:flex; justify-content:space-between; align-items:center;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🗺️</span> ${L==='ar'?'الخريطة الحرارية للمبيعات':'Sales Territory Heatmap'}</h1>
            <button class="btn bg-p" onclick="window.render()" style="color:#fff;border:none;">${L==='ar'?'رجوع':'Back'}</button>
        </div>
        
        <div style="display:flex; gap:15px; margin:15px 0;">
            <div style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;border-radius:50%;background:#ef4444;display:inline-block;"></span> <span style="font-size:0.85rem;color:var(--tx2);">${L==='ar'?'مستهدف':'Targeted'}</span></div>
            <div style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;border-radius:50%;background:#3b82f6;display:inline-block;"></span> <span style="font-size:0.85rem;color:var(--tx2);">${L==='ar'?'تم التواصل':'Contacted'}</span></div>
            <div style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;border-radius:50%;background:#10b981;display:inline-block;"></span> <span style="font-size:0.85rem;color:var(--tx2);">${L==='ar'?'أصبح عميل':'Customer'}</span></div>
        </div>
        
        <div id="sp_map_container" style="width:100%;height:70vh;border-radius:16px;box-shadow:var(--sh-lg);border:1px solid var(--bd);z-index:1;overflow:hidden;position:relative;">
            <div id="map_loader" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg);z-index:2;font-size:1.2rem;font-weight:bold;color:var(--tx2);">
                ${L==='ar'?'جاري تحميل الخريطة...':'Loading Map...'}
            </div>
        </div>
    `;
    
    if (!window.L_map_loaded) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        
        let script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            let heatScript = document.createElement('script');
            heatScript.src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
            heatScript.onload = () => { window.L_map_loaded = true; window.renderMap(); };
            document.head.appendChild(heatScript);
        };
        document.head.appendChild(script);
    } else {
        window.renderMap();
    }
};

window.renderMap = function() {
    let container = document.getElementById('sp_map_container');
    if(!container) return;
    
    let loader = document.getElementById('map_loader');
    if(loader) loader.remove();
    
    // Clear and recreate map div to avoid Leaflet "map already initialized" error
    container.innerHTML = '<div id="real_map" style="width:100%;height:100%;"></div>';
    
    var map = L.map('real_map').setView([30.0131, 31.2089], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    let leads = JSON.parse(localStorage.getItem('leadsData') || '[]');
    let heatPoints = [];
    
    leads.forEach(l => {
        if(l.lat && l.lon) {
            let intensity = (l.status === 'Customer' || l.status === 'عميل') ? 1.0 : (l.status === 'Contacted' || l.status === 'تم التواصل' ? 0.7 : 0.4);
            heatPoints.push([l.lat, l.lon, intensity]);
            
            let color = (l.status === 'Customer' || l.status === 'عميل') ? '#10b981' : ((l.status === 'Contacted' || l.status === 'تم التواصل') ? '#3b82f6' : '#ef4444');
            L.circleMarker([l.lat, l.lon], {radius: 6, color: color, fillColor: color, fillOpacity: 0.8, weight: 1})
             .bindPopup(`<b style="color:#000;">${l.name}</b><br><span style="color:#555;">${l.status}</span><br>${l.phone||''}`)
             .addTo(map);
        }
    });
    
    if(heatPoints.length > 0 && typeof L.heatLayer === 'function') {
        L.heatLayer(heatPoints, {radius: 35, blur: 20, maxZoom: 17, gradient: {0.4: 'red', 0.7: 'blue', 1.0: 'lime'}}).addTo(map);
        
        // Fit bounds to points
        let bounds = L.latLngBounds(heatPoints.map(p => [p[0], p[1]]));
        map.fitBounds(bounds, {padding: [50, 50]});
    }
};

// --- PHASE 5: Target Management ---

window.editCustomerTarget = function(cName) {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let tData = typeof getT === 'function' ? getT() : (window.T || []);
    let customerData = tData.find(r => r.Customer === cName) || { Customer: '', phone: '', address: '', hwTarget: 0, accTarget: 0 };
    
    // Remove existing modal if any
    let existing = document.getElementById('sp_tgt_modal');
    if (existing) existing.remove();
    
    let modal = document.createElement('div');
    modal.id = 'sp_tgt_modal';
    modal.className = 'sp-modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    
    let title = cName ? (L==='ar'?'تعديل بيانات العميل':'Edit Customer Data') : (L==='ar'?'إضافة عميل جديد':'Add New Customer');
    
    modal.innerHTML = `
        <div class="card" style="width:90%; max-width:500px; padding:25px; border-radius:16px; background:var(--bg); box-shadow:0 10px 30px rgba(0,0,0,0.5); position:relative; max-height:90vh; overflow-y:auto;">
            <button onclick="document.getElementById('sp_tgt_modal').remove()" style="position:absolute;top:15px;right:15px;background:none;border:none;font-size:1.5rem;color:var(--tx2);cursor:pointer;padding:5px;">&times;</button>
            <h2 style="margin-bottom:20px; display:flex; align-items:center; gap:10px;"><span style="font-size:1.5rem;">👤</span> ${title}</h2>
            
            <label class="sp-form-label" style="display:block;margin-bottom:8px;font-weight:bold;color:var(--tx2);">${L==='ar'?'اسم العميل':'Customer Name'} <span style="color:red">*</span></label>
            <input type="text" id="tgt_name" class="sbox" value="${customerData.Customer}" ${cName?'disabled':''} style="width:100%;padding:12px;margin-bottom:15px;border-radius:8px;border:1px solid var(--bd);background:${cName?'var(--bg2)':'var(--bg)'};color:var(--tx1);font-size:1rem;">
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div>
                    <label class="sp-form-label" style="display:block;margin-bottom:8px;font-weight:bold;color:var(--tx2);">${L==='ar'?'رقم الهاتف':'Phone'}</label>
                    <input type="tel" id="tgt_phone" class="sbox" value="${customerData.phone||''}" style="width:100%;padding:12px;margin-bottom:15px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx1);font-size:1rem;">
                </div>
                <div>
                    <label class="sp-form-label" style="display:block;margin-bottom:8px;font-weight:bold;color:var(--tx2);">${L==='ar'?'العنوان (أو المنطقة)':'Address/Region'}</label>
                    <input type="text" id="tgt_address" class="sbox" value="${customerData.address||''}" style="width:100%;padding:12px;margin-bottom:15px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx1);font-size:1rem;">
                </div>
            </div>
            
            <div style="background:var(--bg3); padding:15px; border-radius:12px; margin-bottom:20px; border:1px solid var(--bd);">
                <h4 style="margin-bottom:15px; color:var(--tx1);">${L==='ar'?'الاستهداف (Target)':'Targets'}</h4>
                
                <label class="sp-form-label" style="display:block;margin-bottom:8px;font-weight:bold;color:#ff9800;">💻 ${L==='ar'?'تارجت الهاردوير':'HW Target'}</label>
                <input type="number" id="tgt_hw" class="sbox" value="${customerData.hwTarget||0}" style="width:100%;padding:12px;margin-bottom:15px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx1);font-size:1rem;">
                
                <label class="sp-form-label" style="display:block;margin-bottom:8px;font-weight:bold;color:#4caf50;">🎧 ${L==='ar'?'تارجت الإكسسوارات':'Acc Target'}</label>
                <input type="number" id="tgt_acc" class="sbox" value="${customerData.accTarget||0}" style="width:100%;padding:12px;margin-bottom:15px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);color:var(--tx1);font-size:1rem;">
            </div>
            
            <button onclick="window.saveCustomerTarget('${cName.replace(/'/g, "\\'")}')" class="btn btn-p" style="width:100%; padding:14px; font-size:1.1rem; border-radius:8px; display:flex; justify-content:center; align-items:center; gap:10px;">
                <span>💾</span> ${L==='ar'?'حفظ التعديلات':'Save Changes'}
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.saveCustomerTarget = function(originalName) {
    let name = document.getElementById('tgt_name').value.trim();
    let phone = document.getElementById('tgt_phone').value.trim();
    let address = document.getElementById('tgt_address').value.trim();
    let hw = Number(document.getElementById('tgt_hw').value) || 0;
    let acc = Number(document.getElementById('tgt_acc').value) || 0;
    
    if(!name) {
        alert(localStorage.getItem('sp_lang')==='ar'?'يرجى إدخال اسم العميل':'Please enter customer name');
        return;
    }
    
    let tData = typeof getT === 'function' ? getT() : (window.T || []);
    let totalTarget = hw + acc;
    
    if (originalName) {
        // Edit existing
        let idx = tData.findIndex(r => r.Customer === originalName);
        if (idx > -1) {
            tData[idx].phone = phone;
            tData[idx].address = address;
            tData[idx].hwTarget = hw;
            tData[idx].accTarget = acc;
            tData[idx].Target = totalTarget;
        }
    } else {
        // Add new
        let exists = tData.find(r => r.Customer === name);
        if (exists) {
            alert(localStorage.getItem('sp_lang')==='ar'?'هذا العميل مسجل بالفعل، يرجى البحث عنه وتعديله.':'Customer already exists.');
            return;
        }
        tData.unshift({
            Customer: name,
            phone: phone,
            address: address,
            hwTarget: hw,
            accTarget: acc,
            Target: totalTarget,
            'Customer Name': name,
            'Total Target': totalTarget
        });
    }
    
    window.T = tData;
    localStorage.setItem('sp_target', JSON.stringify(tData));
    
    let modal = document.getElementById('sp_tgt_modal');
    if (modal) modal.remove();
    
    if (typeof window.rTgt === 'function') window.rTgt();
    
    if(typeof window.cloudAutoSave === 'function') {
        window.cloudAutoSave(localStorage.getItem('sp_lang')==='ar'?'تم حفظ بيانات العميل يدوياً':'Customer data saved manually');
    }
    
    if (typeof toast === 'function') toast(localStorage.getItem('sp_lang')==='ar'?'تم الحفظ بنجاح!':'Saved successfully!');
};

// --- FIX: Override corrupted generateQuote from index.html ---
window.generateQuote = function(customerName) {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let items = JSON.parse(localStorage.getItem("draft_quote") || "[]");
    if(items.length === 0) items = [{desc:"",qty:1,price:0}];
    let modal = document.createElement("div");
    modal.className = "sp-modal-overlay";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;";
    
    let renderItems = () => items.map((it, i) => `
        <div style="display:flex;gap:10px;margin-bottom:10px;">
            <input type="text" value="${it.desc}" onchange="window.updateQItem(${i},'desc',this.value)" style="flex:2;padding:8px;" class="sbox" placeholder="${L==='ar'?'الصنف / الوصف':'Item / Description'}">
            <input type="number" value="${it.qty}" onchange="window.updateQItem(${i},'qty',this.value)" style="flex:1;padding:8px;" class="sbox" placeholder="${L==='ar'?'الكمية':'Qty'}">
            <input type="number" value="${it.price}" onchange="window.updateQItem(${i},'price',this.value)" style="flex:1;padding:8px;" class="sbox" placeholder="${L==='ar'?'السعر':'Price'}">
            <button onclick="window.delQItem(${i})" class="btn" style="background:#f44336;color:white;padding:8px;">X</button>
        </div>
    `).join("");

    window.updateQItem = (i, field, val) => { items[i][field] = val; localStorage.setItem("draft_quote", JSON.stringify(items)); };
    window.addQItem = () => { items.push({desc:"",qty:1,price:0}); document.getElementById("qItemsList").innerHTML = renderItems(); };
    window.delQItem = (i) => { items.splice(i,1); localStorage.setItem("draft_quote", JSON.stringify(items)); document.getElementById("qItemsList").innerHTML = renderItems(); };
    
    window.printQuote = () => {
        let total = items.reduce((s, it) => s + (it.qty * it.price), 0);
        let printWin = window.open("", "", "width=800,height=900");
        printWin.document.write(`
            <html dir="${L==='ar'?'rtl':'ltr'}"><head><title>${L==='ar'?'عرض سعر':'Quote'} - ${customerName}</title>
            <style>
                body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                .header { border-bottom: 2px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; display:flex; justify-content:space-between; align-items:center; }
                .header h1 { color: #0056b3; margin:0; font-size:2.5rem; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: ${L==='ar'?'right':'left'}; }
                th { background-color: #f8f9fa; color: #0056b3; }
                .total { font-size: 1.5em; font-weight: bold; text-align: ${L==='ar'?'left':'right'}; color: #0056b3; padding-top:20px; border-top:2px solid #ddd; }
                .footer { margin-top: 50px; text-align: center; color: #777; font-size: 0.9em; padding-top:20px; border-top:1px solid #ddd; }
                @media print { body { padding:0; margin:0; } }
            </style>
            </head><body>
                <div class="header">
                    <div><h1>${L==='ar'?'عرض سعر':'Quotation'}</h1><p>${L==='ar'?'التاريخ:':'Date:'} ${new Date().toLocaleDateString(L==='ar'?"ar-EG":"en-US")}</p></div>
                    <div style="text-align:${L==='ar'?'left':'right'};"><h3>${L==='ar'?'العميل /':'Client /'} ${customerName}</h3><p>${L==='ar'?'تحية طيبة وبعد،':'Dear Sir/Madam,'}</p></div>
                </div>
                <table>
                    <thead><tr><th>#</th><th>${L==='ar'?'الصنف / الوصف':'Description'}</th><th>${L==='ar'?'الكمية':'Qty'}</th><th>${L==='ar'?'السعر':'Price'}</th><th>${L==='ar'?'الإجمالي':'Total'}</th></tr></thead>
                    <tbody>
                        ${items.map((it,idx) => `<tr><td>${idx+1}</td><td>${it.desc}</td><td>${it.qty}</td><td>${typeof fmt==='function'?fmt(it.price):it.price}</td><td>${typeof fmt==='function'?fmt(it.qty * it.price):it.qty * it.price}</td></tr>`).join("")}
                    </tbody>
                </table>
                <div class="total">${L==='ar'?'الإجمالي الكلي:':'Grand Total:'} ${typeof fmt==='function'?fmt(total):total}</div>
                <div class="footer">${L==='ar'?'نشكركم لثقتكم بنا. نتمنى لكم يوماً سعيداً.':'Thank you for your business.'}</div>
            </body></html>
        `);
        printWin.document.close();
        setTimeout(() => { printWin.print(); }, 500);
    };

    modal.innerHTML = `
        <div class="card" style="width:90%;max-width:600px;padding:20px;position:relative;background:var(--bg);box-shadow:0 10px 30px rgba(0,0,0,0.5);border-radius:12px;">
            <button onclick="this.parentElement.parentElement.remove()" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:1.5rem;color:var(--tx2);cursor:pointer;">&times;</button>
            <h2 style="margin-bottom:20px;">📄 ${L==='ar'?'عرض سعر للعميل:':'Quote for:'} <span style="color:var(--p);">${customerName}</span></h2>
            
            <div id="qItemsList" style="max-height:40vh;overflow-y:auto;margin-bottom:15px;">
                ${renderItems()}
            </div>
            
            <button onclick="window.addQItem()" class="btn" style="background:var(--bg3);color:var(--tx1);width:100%;margin-bottom:20px;border:1px dashed var(--bd);">+ ${L==='ar'?'إضافة صنف':'Add Item'}</button>
            
            <button onclick="window.printQuote()" class="btn btn-p" style="width:100%;padding:12px;font-size:1.1rem;display:flex;justify-content:center;gap:10px;">
                <span style="font-size:1.2rem;">🖨️</span> ${L==='ar'?'طباعة / استخراج PDF':'Print / Export PDF'}
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};
// --- PHASE 6: Firestore Realtime Sync & Offline Persistence ---
(function() {
    let fCheck = setInterval(() => {
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            clearInterval(fCheck);
            initRealtimeSync();
        }
    }, 1000);

    let isSyncingFromServer = false;
    let localHashes = { sales: {}, targets: {}, customers: {}, leads: {} };
    
    // Simple hash function for diffing
    function hashObj(obj) {
        let str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    function initRealtimeSync() {
        const uid = currentUser.uid;
        console.log("Initializing Realtime Sync for UID:", uid);

        // Define collections to sync
        const collections = [
            { name: 'sales', getArr: () => window.S || [], setArr: (val) => window.S = val, trigger: () => { if(window.pState && window.pState.currentTab === 'dash' && typeof window.rDash === 'function') window.rDash(); } },
            { name: 'targets', getArr: () => window.T || [], setArr: (val) => window.T = val, trigger: () => { if(window.pState && window.pState.currentTab === 'tgt' && typeof window.rTgt === 'function') window.rTgt(); } },
            { name: 'customers', getArr: () => window.C || [], setArr: (val) => window.C = val, trigger: () => {} },
            { name: 'leads', getArr: () => JSON.parse(localStorage.getItem('sp_leads') || '[]'), setArr: (val) => localStorage.setItem('sp_leads', JSON.stringify(val)), trigger: () => { if(typeof P !== 'undefined' && P === 'leads' && typeof window.rLeads === 'function') window.rLeads(); } }
        ];

        // 1. Listeners
        collections.forEach(col => {
            db.collection('users').doc(uid).collection(col.name).onSnapshot(snap => {
                if (snap.metadata.hasPendingWrites) return; 
                let newArr = [];
                localHashes[col.name] = {};
                
                snap.forEach(doc => {
                    let data = doc.data();
                    data._id = doc.id;
                    newArr.push(data);
                    
                    // Cache the hash so we don't re-upload it
                    let hashData = {...data}; delete hashData._id;
                    localHashes[col.name][doc.id] = hashObj(hashData);
                });
                
                if (col.name === 'sales') newArr.sort((a, b) => new Date(b.Date||0) - new Date(a.Date||0));
                
                isSyncingFromServer = true;
                col.setArr(newArr);
                
                // Keep localStorage in sync just in case
                if (col.name === 'sales') localStorage.setItem('sp_sales', JSON.stringify(newArr));
                if (col.name === 'targets') localStorage.setItem('sp_target', JSON.stringify(newArr));
                if (col.name === 'customers') localStorage.setItem('sp_customers', JSON.stringify(newArr));
                
                col.trigger();
                isSyncingFromServer = false;
            });
        });
        
        // 2. Override cloudAutoSave to push diffs
        window.cloudAutoSave = async function(msg) {
            if (isSyncingFromServer) return;
            if (!currentUser || !db) return;
            
            try {
                const uid = currentUser.uid;
                
                const syncArray = async (colDef) => {
                    let arr = colDef.getArr();
                    let colRef = db.collection('users').doc(uid).collection(colDef.name);
                    
                    let batch = db.batch();
                    let count = 0;
                    
                    for (let i = 0; i < arr.length; i++) {
                        let item = arr[i];
                        
                        // Copy for hashing
                        let hashData = {...item}; 
                        delete hashData._id;
                        let currentHash = hashObj(hashData);
                        
                        if (!item._id) {
                            item._id = db.collection('users').doc().id; 
                        }
                        
                        // If it's new or changed
                        if (localHashes[colDef.name][item._id] !== currentHash) {
                            let docRef = colRef.doc(item._id);
                            batch.set(docRef, item);
                            localHashes[colDef.name][item._id] = currentHash; // Update cache
                            count++;
                        }
                        
                        if (count === 490) {
                            await batch.commit();
                            batch = db.batch();
                            count = 0;
                        }
                    }
                    if (count > 0) await batch.commit();
                };
                
                for (let col of collections) {
                    await syncArray(col);
                }
                
                if (typeof toast === 'function') toast('تم مزامنة التعديلات مع السحابة', 'success');
                console.log("Realtime Sync Complete:", msg);
            } catch(e) {
                console.error("Realtime Sync Error:", e);
                if (typeof toast === 'function') toast('خطأ في المزامنة', 'error');
            }
        };
        
        window.saveToFirebaseCloud = window.cloudAutoSave;
    }
})();
// --- PHASE 6: Maps Routing (Leaflet Routing Machine) ---

window.L_routing_loaded = false;

// Override renderMap to include Routing
const originalRenderMap = window.renderMap;
window.renderMap = function() {
    let container = document.getElementById('sp_map_container');
    if(!container) return;
    
    // Load Leaflet Routing CSS if not present
    if (!document.getElementById('lrm-css')) {
        let css = document.createElement('link');
        css.id = 'lrm-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css';
        document.head.appendChild(css);
    }
    
    // Load Leaflet Routing Script
    if (!window.L_routing_loaded) {
        let script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js';
        script.onload = () => { 
            window.L_routing_loaded = true; 
            executeRenderMap(); 
        };
        document.head.appendChild(script);
        return; // wait for script
    }
    
    executeRenderMap();
};

function executeRenderMap() {
    let L_lang = localStorage.getItem('sp_lang') || 'ar';
    let container = document.getElementById('sp_map_container');
    let loader = document.getElementById('map_loader');
    if(loader) loader.remove();
    
    // Add routing controls UI above the map
    container.innerHTML = `
        <div style="position:absolute; top:10px; right:10px; z-index:1000; display:flex; gap:10px; background:var(--bg); padding:10px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.2);">
            <button id="btnRoute" class="btn btn-p" style="font-size:0.9rem; padding:6px 12px; font-weight:bold;">${L_lang==='ar'?'🗺️ رسم خط السير (Routing)':'🗺️ Draw Route'}</button>
            <button id="btnClearRoute" class="btn bg-r" style="font-size:0.9rem; padding:6px 12px; font-weight:bold; display:none;">${L_lang==='ar'?'❌ مسح الخط':'❌ Clear Route'}</button>
        </div>
        <div id="real_map" style="width:100%;height:100%;"></div>
    `;
    
    var map = L.map('real_map').setView([30.0444, 31.2357], 12); // Default to Cairo
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    let heatPoints = [];
    let waypoints = []; // for routing
    
    // Add Leads
    let leadsData = typeof getLeads === 'function' ? getLeads() : (JSON.parse(localStorage.getItem('sp_leads')||'[]'));
    leadsData.forEach(l => {
        if(l.lat && l.lng) {
            let lat = parseFloat(l.lat), lng = parseFloat(l.lng);
            heatPoints.push([lat, lng, 1]);
            waypoints.push(L.latLng(lat, lng));
            L.marker([lat, lng]).bindPopup(`<b style="color:#000;">${l.name}</b><br><span style="color:#555;">${l.status}</span><br>${l.phone||''}`).addTo(map);
        }
    });

    if(heatPoints.length > 0 && typeof L.heatLayer === 'function') {
        L.heatLayer(heatPoints, {radius: 35, blur: 20, maxZoom: 17, gradient: {0.4: 'red', 0.7: 'blue', 1.0: 'lime'}}).addTo(map);
        let bounds = L.latLngBounds(heatPoints.map(p => [p[0], p[1]]));
        map.fitBounds(bounds, {padding: [50, 50]});
    } else {
        // Try to locate user if no points
        map.locate({setView: true, maxZoom: 14});
    }
    
    let routingControl = null;
    
    document.getElementById('btnRoute').onclick = () => {
        if (waypoints.length < 2) {
            alert(L_lang==='ar'?'يجب إضافة موقعين على الأقل للعملاء لرسم خط السير!':'You need at least 2 locations to draw a route!');
            return;
        }
        
        document.getElementById('btnRoute').style.display = 'none';
        document.getElementById('btnClearRoute').style.display = 'block';
        
        if (typeof toast === 'function') toast(L_lang==='ar'?'جاري رسم خط السير الأقصر...':'Calculating shortest route...', 'info');
        
        routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{color: '#0ea5e9', opacity: 0.8, weight: 6}]
            },
            createMarker: function() { return null; } // Don't add extra markers
        }).addTo(map);
    };
    
    document.getElementById('btnClearRoute').onclick = () => {
        if(routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
        document.getElementById('btnRoute').style.display = 'block';
        document.getElementById('btnClearRoute').style.display = 'none';
    };
}
// --- PHASE 7: Merchant Profile ---

window.openCustomerProfile = function(cName) {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let sData = typeof getS === 'function' ? getS() : (window.S || []);
    let cData = typeof getC === 'function' ? getC() : (window.C || []);
    let tData = typeof getT === 'function' ? getT() : (window.T || []);
    
    // 1. Get Master Data
    let tRow = tData.find(r => (r.Customer||'').trim() === cName.trim() || (r.Name||'').trim() === cName.trim() || (r.Merchant||'').trim() === cName.trim()) || { Customer: cName, phone: '', address: '' };
    let targetValue = parseFloat(tRow.Target || tRow['Target Value'] || tRow.target || tRow.hwTarget || 0);
    if(tRow.hwTarget && tRow.accTarget) targetValue = parseFloat(tRow.hwTarget) + parseFloat(tRow.accTarget);
    
    // 2. Aggregate Sales
    let cSales = sData.filter(r => r.Customer === cName);
    let totalSales = 0;
    let hwSales = 0;
    let accSales = 0;
    
    cSales.forEach(s => {
        let val = parseFloat(s.Value) || 0;
        totalSales += val;
        let isHw = (s['Item Name']||s.item||s.name||'').toLowerCase().includes('hw') || (s.Category === 'Hardware');
        let isAcc = (s['Item Name']||s.item||s.name||'').toLowerCase().includes('acc') || (s.Category === 'Accessories');
        // Default inference if category is unknown (Phase 1 logic used this)
        if(!isHw && !isAcc) {
            if(s.Value > 1000) isHw = true; else isAcc = true;
        }
        if(isHw) hwSales += val;
        if(isAcc) accSales += val;
    });
    
    // 3. Aggregate Collections
    let cColls = cData.filter(r => r.Customer === cName);
    let totalColls = 0;
    cColls.forEach(c => {
        totalColls += (parseFloat(c.Value) || 0);
    });
    
    // 4. Calculate Balance
    let balance = totalSales - totalColls;
    
    // Build Modal UI
    let modal = document.createElement("div");
    modal.className = "sp-modal-overlay";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:10000;display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:20px;";
    
    let content = `
    <div class="sp-modal-content" style="background:var(--bg); color:var(--tx); border-radius:24px; padding:30px; width:100%; max-width:900px; box-shadow:var(--sh-lg); border:1px solid var(--bd); max-height:90vh; overflow-y:auto;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--bd); padding-bottom:15px; margin-bottom:25px;">
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, var(--p), var(--ac)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:2rem; font-weight:bold;">
                    ${cName.charAt(0)}
                </div>
                <div>
                    <h2 style="margin:0; font-size:1.8rem;">${cName}</h2>
                    <p style="margin:5px 0 0; color:var(--tx2); font-size:1rem;">
                        ${tRow.phone ? '📞 ' + tRow.phone : ''} 
                        ${tRow.address ? ' | 📍 ' + tRow.address : ''}
                    </p>
                </div>
            </div>
            <button onclick="this.closest('.sp-modal-overlay').remove()" style="background:transparent; border:none; color:var(--tx2); font-size:1.8rem; cursor:pointer;">&times;</button>
        </div>
        
        <!-- KPIs -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-bottom:30px;">
            <div style="background:var(--bg2); padding:15px; border-radius:12px; border:1px solid var(--bd); text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="margin:0 0 5px; color:var(--tx2); font-size:0.9rem;">${L==='ar'?'الهدف (التارجت)':'Target'}</h3>
                <div style="font-size:1.5rem; font-weight:bold; color:var(--am);">${typeof fmt==='function'?fmt(targetValue):targetValue}</div>
            </div>
            <div style="background:var(--bg2); padding:15px; border-radius:12px; border:1px solid var(--bd); text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="margin:0 0 5px; color:var(--tx2); font-size:0.9rem;">${L==='ar'?'المسحوبات (مبيعات)':'Sales'}</h3>
                <div style="font-size:1.5rem; font-weight:bold; color:var(--p);">${typeof fmt==='function'?fmt(totalSales):totalSales}</div>
                <div style="font-size:0.8rem; color:var(--gn); font-weight:bold; margin-top:5px;">
                    ${targetValue > 0 ? ((totalSales / targetValue) * 100).toFixed(1) + '% تحقيق' : ''}
                </div>
            </div>
            <div style="background:var(--bg2); padding:15px; border-radius:12px; border:1px solid var(--bd); text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="margin:0 0 5px; color:var(--tx2); font-size:0.9rem;">${L==='ar'?'التحصيلات (دفعات)':'Collections'}</h3>
                <div style="font-size:1.5rem; font-weight:bold; color:var(--ac);">${typeof fmt==='function'?fmt(totalColls):totalColls}</div>
            </div>
            <div style="background:var(--bg2); padding:15px; border-radius:12px; border:1px solid var(--bd); text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h3 style="margin:0 0 5px; color:var(--tx2); font-size:0.9rem;">${L==='ar'?'الرصيد المتبقي (مديونية)':'Balance'}</h3>
                <div style="font-size:1.5rem; font-weight:bold; color:${balance > 0 ? '#f44336' : '#4caf50'};">${typeof fmt==='function'?fmt(balance):balance}</div>
            </div>
        </div>

        <!-- History Tables -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <!-- Sales -->
            <div style="background:var(--bg2); border-radius:16px; border:1px solid var(--bd); padding:20px; overflow:hidden;">
                <h3 style="margin:0 0 15px; color:var(--tx); border-bottom:1px solid var(--bd); padding-bottom:10px;">🛒 ${L==='ar'?'سجل الفواتير':'Sales History'}</h3>
                <div style="max-height:300px; overflow-y:auto;">
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead>
                            <tr style="color:var(--tx2); font-size:0.9rem;">
                                <th style="padding:10px; border-bottom:1px solid var(--bd);">${L==='ar'?'التاريخ':'Date'}</th>
                                <th style="padding:10px; border-bottom:1px solid var(--bd);">${L==='ar'?'الصنف':'Item'}</th>
                                <th style="padding:10px; border-bottom:1px solid var(--bd);">${L==='ar'?'القيمة':'Value'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cSales.length > 0 ? cSales.sort((a,b)=>new Date(b.Date)-new Date(a.Date)).map(s => `
                                <tr>
                                    <td style="padding:10px; border-bottom:1px solid var(--bd); font-size:0.9rem;">${new Date(s.Date).toLocaleDateString(L==='ar'?'ar-EG':'en-US')}</td>
                                    <td style="padding:10px; border-bottom:1px solid var(--bd); font-size:0.9rem;">${s['Item Name']||s.item||s.name||'--'}</td>
                                    <td style="padding:10px; border-bottom:1px solid var(--bd); font-weight:bold; color:var(--p);">${typeof fmt==='function'?fmt(s.Value):s.Value}</td>
                                </tr>
                            `).join('') : `<tr><td colspan="3" style="padding:20px; text-align:center; color:var(--tx2);">${L==='ar'?'لا توجد مبيعات':'No sales'}</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Collections -->
            <div style="background:var(--bg2); border-radius:16px; border:1px solid var(--bd); padding:20px; overflow:hidden;">
                <h3 style="margin:0 0 15px; color:var(--tx); border-bottom:1px solid var(--bd); padding-bottom:10px;">💵 ${L==='ar'?'سجل التحصيلات':'Collections History'}</h3>
                <div style="max-height:300px; overflow-y:auto;">
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead>
                            <tr style="color:var(--tx2); font-size:0.9rem;">
                                <th style="padding:10px; border-bottom:1px solid var(--bd);">${L==='ar'?'التاريخ':'Date'}</th>
                                <th style="padding:10px; border-bottom:1px solid var(--bd);">${L==='ar'?'الملاحظات':'Notes'}</th>
                                <th style="padding:10px; border-bottom:1px solid var(--bd);">${L==='ar'?'المبلغ':'Amount'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cColls.length > 0 ? cColls.sort((a,b)=>new Date(b.Date)-new Date(a.Date)).map(c => `
                                <tr>
                                    <td style="padding:10px; border-bottom:1px solid var(--bd); font-size:0.9rem;">${new Date(c.Date).toLocaleDateString(L==='ar'?'ar-EG':'en-US')}</td>
                                    <td style="padding:10px; border-bottom:1px solid var(--bd); font-size:0.9rem;">${c.Notes||c.notes||'--'}</td>
                                    <td style="padding:10px; border-bottom:1px solid var(--bd); font-weight:bold; color:var(--ac);">${typeof fmt==='function'?fmt(c.Value):c.Value}</td>
                                </tr>
                            `).join('') : `<tr><td colspan="3" style="padding:20px; text-align:center; color:var(--tx2);">${L==='ar'?'لا توجد تحصيلات':'No collections'}</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
    
    modal.innerHTML = content;
    
    // Add CSS for mobile responsiveness
    let style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 768px) {
            .sp-modal-content > div:last-child {
                grid-template-columns: 1fr !important;
            }
        }
    `;
    modal.appendChild(style);
    
    document.body.appendChild(modal);
};
// --- PHASE 8: UI and Settings Improvements ---
(function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    
    // 1. Force Dashboard on Initial Load (Override 'prospects' bug)
    // The issue was window.onload reading window.location.hash
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.location.hash) {
                history.replaceState(null, null, ' '); // clear hash
                P = 'dash';
                if (typeof buildNav === 'function') buildNav();
                if (typeof render === 'function') render();
            }
        }, 50);
    });

    // 2. Global CSS Fixes for Tables and Font Sizes
    let sysStyles = document.createElement('style');
    sysStyles.id = 'phase8_styles';
    sysStyles.innerHTML = `
        /* Better table layout for large data */
        .tb table {
            table-layout: auto !important;
            width: 100%;
            min-width: 600px; /* Force minimum width to prevent squishing */
        }
        .tb {
            overflow-x: auto !important; /* Enable horizontal scrolling for wide tables */
            -webkit-overflow-scrolling: touch;
        }
        .tb td, .tb th {
            word-break: break-word; /* Allow text wrapping if needed */
            white-space: normal !important;
        }
        
        /* Font size scaling variables */
        :root {
            --font-scale: ${localStorage.getItem('sp_font_scale') || '100'}%;
        }
        body {
            font-size: var(--font-scale) !important;
        }
        
        /* Ensure Inputs and Buttons inherit correctly */
        input, button, select, textarea {
            font-size: inherit;
        }
    `;
    document.head.appendChild(sysStyles);

    // 3. Inject Font Size settings into Settings Page
    const origRender = window.render;
    if (typeof origRender === 'function') {
        window.render = function() {
            origRender();
            if (typeof P !== 'undefined' && P === 'settings') {
                setTimeout(() => {
                    let m = document.getElementById('M');
                    if (m && !document.getElementById('fontSizeSettingBlock')) {
                        // Find a good place to inject (before the danger zone / clear data)
                        let dangerZone = m.querySelector('div[style*="background:var(--bg2)"] button[onclick*="localStorage.clear"]');
                        if (dangerZone) {
                            let parentDiv = dangerZone.closest('div[style*="background:var(--bg2)"]');
                            if (parentDiv) {
                                let fSizeBlock = document.createElement('div');
                                fSizeBlock.id = 'fontSizeSettingBlock';
                                fSizeBlock.className = 'card';
                                fSizeBlock.style.cssText = 'margin-top:20px; padding:20px;';
                                fSizeBlock.innerHTML = `
                                    <h3 style="margin-bottom:15px; color:var(--p); display:flex; align-items:center; gap:10px;">
                                        <span style="font-size:1.5rem;">🔎</span> 
                                        ${L==='ar'?'حجم الخط والشاشة':'Display & Font Size'}
                                    </h3>
                                    <p style="color:var(--tx2); margin-bottom:15px;">
                                        ${L==='ar'?'تحكم في حجم خط التطبيق إذا كنت تواجه صعوبة في قراءة النصوص الكبيرة أو الصغيرة.':'Control the application font size.'}
                                    </p>
                                    <div style="display:flex; align-items:center; gap:15px;">
                                        <button class="btn" style="background:var(--bg3); font-size:1.2rem; padding:10px 15px;" onclick="window.changeAppFontSize(-10)">A-</button>
                                        <div id="currentFontSizeLbl" style="font-size:1.2rem; font-weight:bold; min-width:60px; text-align:center;">${localStorage.getItem('sp_font_scale') || '100'}%</div>
                                        <button class="btn" style="background:var(--bg3); font-size:1.2rem; padding:10px 15px;" onclick="window.changeAppFontSize(10)">A+</button>
                                    </div>
                                    <div style="margin-top:15px;">
                                        <button class="btn btn-p" onclick="window.changeAppFontSize(0, true)">${L==='ar'?'إعادة الافتراضي':'Reset Default'}</button>
                                    </div>
                                `;
                                m.insertBefore(fSizeBlock, parentDiv);
                            }
                        }
                    }
                }, 100);
            }
        };
    }

    // Font size changer function
    window.changeAppFontSize = function(delta, reset = false) {
        let current = parseInt(localStorage.getItem('sp_font_scale') || '100');
        if (reset) {
            current = 100;
        } else {
            current += delta;
            if (current < 70) current = 70;
            if (current > 150) current = 150;
        }
        localStorage.setItem('sp_font_scale', current);
        document.documentElement.style.setProperty('--font-scale', current + '%');
        
        let lbl = document.getElementById('currentFontSizeLbl');
        if (lbl) lbl.textContent = current + '%';
        
        if (typeof toast === 'function') toast(L==='ar'?'تم تغيير حجم الخط':'Font size updated');
    };

})();
