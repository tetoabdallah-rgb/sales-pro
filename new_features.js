
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
            background: url('logo_2b.png') no-repeat center center;
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
            background: url('logo_2b.png') no-repeat center center;
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
    let S_data = getS();
    let cList = [...new Set(S_data.map(r=>r.Customer).filter(Boolean))];
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



// --- LEADS ---
window.rLeads = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let html = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🤝</span> ${L==='ar'?'عملاء محتملين (Leads)':'Potential Leads'}</h1>
            <button class="btn bg-p" onclick="addLeadModal()" style="color:#fff;border:none;">${L==='ar'?'إضافة عميل محتمل':'Add Lead'}</button>
        </div>
        <div class="card" id="leadsList" style="margin-top:20px;">
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
    `;
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
        <label class="sp-form-label">${L==='ar'?'المصدر (فيسبوك، زيارة، الخ)':'Source'}</label>
        <input type="text" id="nlSource" class="sp-form-input">
        <button class="sp-btn-primary" onclick="saveLead()">${L==='ar'?'حفظ العميل':'Save Lead'}</button>
    `;
    let m = document.createElement('div');
    m.className = 'sp-modal-overlay';
    m.id = 'lModal';
    m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
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

    let tt=0, ta=0;
    if(tData && tData.length > 0) {
        tData.forEach(r => { tt += Number(r.Target)||0; ta += cS(r.Customer); });
    }
    
    let mDiv = document.getElementById('M');
    if(!mDiv) return;
    
    mDiv.innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${window.ICONS ? window.ICONS.targets : '🎯'}</span> ${typeof t==='function'?t('targets'):(L==='ar'?'المستهدفات':'Targets')}</h1>
            <button id="bExTgt" class="btn bg-g" style="color:#fff;border:none;margin-left:auto;"><span style="font-size:1rem;">&#x1F4E5;</span> Excel</button>
        </div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'التارجت':'Target'}</div><div class="vl">${typeof aFmt==='function'?aFmt(tt):tt}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'المحقق':'Achieved'}</div><div class="vl">${typeof aFmt==='function'?aFmt(ta):ta}</div></div>
            <div class="ki"><div class="lb">%</div><div class="vl">${typeof aFmt==='function'?aFmt(tt>0?ta/tt*100:0,true):(tt>0?(ta/tt*100).toFixed(1)+'%':'0%')}</div></div>
        </div>
        <div class="tb">
            <div class="tbt"><h3>${typeof t==='function'?t('targets'):(L==='ar'?'المستهدفات':'Targets')}</h3><input class="sbox" id="tsr" placeholder="..."></div>
            <div class="tbs">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr>
                            <th>${L==='ar'?'العميل':'Customer'}</th>
                            <th>${L==='ar'?'التارجت':'Target'}</th>
                            <th>${L==='ar'?'المحقق':'Achieved'}</th>
                            <th style="width:200px;">${L==='ar'?'نسبة التحقيق':'% Progress'}</th>
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
    `;
    
    if(document.getElementById('bExTgt') && typeof exportToExcel === 'function') {
        document.getElementById('bExTgt').onclick = () => exportToExcel(tData.map(r => ({ Customer: r.Customer, Target: Number(r.Target)||0, Achieved: cS(r.Customer) })), 'Targets_Report');
    }

    function fTg(d){
        let ttb = document.getElementById('ttb');
        if(!ttb) return;
        ttb.innerHTML = d.map(r => {
            let tg = Number(r.Target)||0, a = cS(r.Customer), p = tg>0 ? a/tg*100 : 0;
            let pColor = p >= 100 ? 'var(--gn)' : p >= 60 ? 'var(--am)' : 'var(--rd)';
            let pBar = `<div style="width:100%;background:var(--bg3);border-radius:10px;height:12px;overflow:hidden;position:relative;min-width:150px;border:1px solid var(--bd);">
                            <div style="width:${Math.min(p, 100)}%;background:${pColor};height:100%;transition:width 0.5s;"></div>
                        </div>
                        <div style="font-size:0.85rem;color:var(--tx1);font-weight:bold;margin-top:4px;">${typeof pc==='function'?pc(p):p.toFixed(1)+'%'}</div>`;
            
            return `<tr>
                <td style="font-weight:bold;">${r.Customer}</td>
                <td style="color:var(--tx2);">${typeof fmt==='function'?fmt(tg):tg}</td>
                <td style="color:var(--ac);font-weight:bold;">${typeof fmt==='function'?fmt(a):a}</td>
                <td style="vertical-align:middle;padding:10px;">${pBar}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">${typeof fmt==='function'?fmt(cSF(r.Customer,window.isAcc)):0}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">${typeof fmt==='function'?fmt(cPF(r.Customer,window.isAcc)):0}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">${typeof fmt==='function'?fmt(cSF(r.Customer,window.isHW)):0}</td>
                <td style="color:var(--tx2);font-size:0.9rem;">${typeof fmt==='function'?fmt(cPF(r.Customer,window.isHW)):0}</td>
                <td><span class="badge ${p>=100?'bg-g':p>=60?'bg-a':'bg-r'}">${p>=100?'&#x2B50;':p>=60?'&#x1F44D;':'&#x1F44E;'}</span></td>
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
        let d = typeof pd === 'function' ? pd(r['Order Date']) : r['Order Date'];
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



// --- FONT SIZE TOGGLER ---
(function initFontResizer() {
    if(document.getElementById('font-resizer-btn')) return;
    
    // Default size is 0 (normal)
    let currentSize = parseInt(localStorage.getItem('sp_font_size') || '0');
    const sizes = ['16px', '18px', '20px'];
    
    function applySize() {
        document.documentElement.style.fontSize = sizes[currentSize];
    }
    applySize();
    
    let btn = document.createElement('div');
    btn.id = 'font-resizer-btn';
    btn.innerHTML = 'Aa';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 45px;
        height: 45px;
        background: var(--ac, #4285F4);
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        z-index: 9999;
        transition: transform 0.2s, background 0.2s;
        user-select: none;
    `;
    
    btn.onclick = () => {
        currentSize = (currentSize + 1) % sizes.length;
        localStorage.setItem('sp_font_size', currentSize);
        applySize();
        
        // simple animation
        btn.style.transform = 'scale(0.8)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);
        
        if (typeof toast === 'function') {
            let labels = ['خط عادي', 'خط كبير', 'خط كبير جداً'];
            toast(labels[currentSize]);
        }
    };
    
    document.body.appendChild(btn);
})();
